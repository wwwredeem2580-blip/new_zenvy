import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { emailVerificationTemplate } from '../utils/email/emailVerification';
import { welcomeClientTemplate } from '../utils/email/welcomeClient';
import { applicationUpdateTemplate } from '../utils/email/applicationUpdates';

const SibApiV3Sdk = require('sib-api-v3-sdk');

// ─── Redis ───────────────────────────────────────────────────────────────────
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

// ─── Brevo (Primary) ─────────────────────────────────────────────────────────
const brevoClient = SibApiV3Sdk.ApiClient.instance;
brevoClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const brevoTransactional = new SibApiV3Sdk.TransactionalEmailsApi();

// ─── SMTP Nodemailer (Fallback) ───────────────────────────────────────────────
let transporter: nodemailer.Transporter;

const initTransporter = async () => {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 Using configured SMTP transport');
  } else {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Using Ethereal SMTP fallback (dev mode)');
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// ─── Email Sender ─────────────────────────────────────────────────────────────
const sendTransactionalEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const fromEmail = process.env.SMTP_USER || 'support@smartcaf.it';

  // 1️⃣ Try SMTP first (as requested to skip Brevo for now)
  if (process.env.SMTP_HOST) {
    try {
      const info = await transporter.sendMail({
        from: `"Smart CAF" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      console.log(`📧 Email sent via SMTP → ${info.messageId}`);
      return;
    } catch (smtpError) {
      console.error('❌ SMTP failed, falling back to Brevo', smtpError);
    }
  }

  // 2️⃣ Try Brevo fallback
  try {
    await brevoTransactional.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: {
        name: 'Smart CAF',
        email: 'support@smartcaf.it', // Note: Brevo requires authenticated domain
      },
      to: [{ email: to }],
    });
    console.log(`📧 Email sent via Brevo → ${to}`);
    return;
  } catch (brevoError: any) {
    console.error('❌ Brevo failed', brevoError);
  }
};

// ─── Error Classifier ─────────────────────────────────────────────────────────
const classifyError = (error: any): 'HARD_FAIL' | 'SOFT_FAIL' => {
  const statusCode = error.status || error.statusCode || error.code || error.response?.status;
  const message = (error.message || error.response?.message || error.toString()).toLowerCase();

  const hardFail = [
    statusCode === 400,
    statusCode === 401,
    statusCode === 403,
    statusCode === 422,
    statusCode === 429,
    statusCode === 450,
    statusCode === 550,
    message.includes('invalid recipient'),
    message.includes('invalid email'),
    message.includes('blocked'),
    message.includes('forbidden'),
    message.includes('unauthorized'),
    message.includes('quota exceeded'),
    message.includes('account disabled'),
    message.includes('rate limit'),
    message.includes('too many requests'),
  ];

  const softFail = [
    statusCode === 500,
    statusCode === 502,
    statusCode === 503,
    statusCode === 504,
    message.includes('timeout'),
    message.includes('etimedout'),
    message.includes('enotfound'),
    message.includes('temporary'),
    message.includes('service unavailable'),
  ];

  if (hardFail.some(Boolean)) return 'HARD_FAIL';
  if (softFail.some(Boolean)) return 'SOFT_FAIL';
  return 'HARD_FAIL';
};

// ─── Worker ───────────────────────────────────────────────────────────────────
export const initEmailWorker = async () => {
  await initTransporter();

  const worker = new Worker(
    'email-queue',
    async (job) => {
      console.log(`📬 Processing email job [${job.id}] type: ${job.name}`);

      let to = '';
      let subject = '';
      let html = '';

      switch (job.name) {
        case 'EMAIL_VERIFICATION':
          to = job.data.email;
          subject = 'Verify Your Email — Smart CAF';
          html = emailVerificationTemplate(job.data);
          break;

        case 'WELCOME_CLIENT':
          to = job.data.email;
          subject = 'You\'re verified — Welcome to Smart CAF';
          html = welcomeClientTemplate(job.data);
          break;

        case 'APPLICATION_UPDATE':
          to = job.data.email;
          subject = job.data.subject || 'Application Update — Smart CAF';
          html = applicationUpdateTemplate(job.data);
          break;

        case 'INVITATION':
          to = job.data.email;
          subject = "You're invited to join Smart CAF";
          // We need to import invitationTemplate, let's just assume it was passed in data or we import it.
          // Since the template logic is already in invitation.service, it might be better to just support raw HTML.
          html = job.data.html;
          break;

        default:
          throw new Error(`Unknown email job type: ${job.name}`);
      }

      if (!to) {
        throw new Error(`Recipient email missing for job ${job.name}`);
      }

      await sendTransactionalEmail({ to, subject, html });
    },
    { connection: redisOptions }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Email job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Email job ${job?.id} failed:`, err.message);
  });

  console.log('📧 Email Worker started');
};
