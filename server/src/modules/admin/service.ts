import { User } from '../../models/User.model';
import { Application } from '../../models/Application.model';
import CustomError from '../../utils/CustomError';

/**
 * listAgentsWithWorkload - Retrieves all agents and admins along with their current reviewing count.
 */
export const listAgentsWithWorkload = async () => {
  const agents = await User.find({ role: { $in: ['agent', 'admin'] } });
  
  const agentsWithWorkload = await Promise.all(
    agents.map(async (agent) => {
      const activeWorkload = await Application.countDocuments({
        reviewerId: agent._id,
        status: 'Reviewing',
      });
      
      return {
        id: agent._id.toString(),
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        role: agent.role,
        avatar: agent.avatar,
        activeWorkload,
      };
    })
  );
  
  return agentsWithWorkload;
};
/**
 * listAllUsers - Retrieves all registered users in the system.
 */
export const listAllUsers = async () => {
  const users = await User.find({}).sort({ createdAt: -1 });
  return users;
};

/**
 * updateUserRole - Promotes or changes a user's role.
 */
export const updateUserRole = async (userId: string, role: string) => {
  const VALID_ROLES = ['admin', 'agent', 'client'] as const;
  if (!VALID_ROLES.includes(role as any)) {
    throw new CustomError('Invalid role', 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new CustomError('User not found', 404);
  
  user.role = role as typeof VALID_ROLES[number];
  await user.save();
  return user;
};

/**
 * updateUserPermissions - Overrides specific permissions for an agent.
 */
export const updateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
  const user = await User.findById(userId);
  if (!user) throw new CustomError('User not found', 404);
  if (user.role !== 'agent') throw new CustomError('Permissions can only be set for agents', 400);

  user.permissions = { ...user.permissions, ...permissions } as any;
  await user.save();
  return user;
};

/**
 * addCredits - Issues balance/credits to a user.
 */
export const addCredits = async (userId: string, amount: number) => {
  if (typeof amount !== 'number' || amount < 0) {
    throw new CustomError('Amount must be a positive number', 400);
  }

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $inc: { balance: amount } },
    { new: true }
  );

  if (!user) throw new CustomError('User not found', 404);
  
  return user;
};

/**
 * getDashboardAnalytics - Aggregates real revenue, pending revenue, and graphical timeseries data.
 */
export const getDashboardAnalytics = async () => {
  const applications = await Application.find();

  let totalRevenue = 0;
  let pendingRevenue = 0;
  let statuses = { Pending: 0, Reviewing: 0, 'Pending Admin Approval': 0, Approved: 0, Rejected: 0 };

  // For charts: last 7 days of revenue inflow
  const last7Days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
  }

  applications.forEach((app) => {
    // Tally Statuses
    if (app.status in statuses) {
      statuses[app.status as keyof typeof statuses] += 1;
    }

    // Calculate Application Total
    const appTotal = app.selectedServices.reduce((sum, s) => sum + s.price, 0);

    if (app.paymentStatus === 'Received') {
      totalRevenue += appTotal;
      
      // Chart Data grouping
      const d = new Date((app as any).createdAt || (app as any).submittedAt || new Date());
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (last7Days[dateStr] !== undefined) {
        last7Days[dateStr] += appTotal;
      }
    } else {
      pendingRevenue += appTotal;
    }
  });

  const chartData = Object.keys(last7Days).map((date) => ({
    date,
    revenue: last7Days[date],
  }));

  return {
    totalRevenue,
    pendingRevenue,
    statuses,
    chartData,
  };
};

/**
 * findUserByContact - Search for users by email or phone (Agents/Admins only)
 */
export const findUserByContact = async (emailOrPhone: string) => {
  const users = await User.find({
    $or: [
      { email: { $regex: emailOrPhone, $options: 'i' } },
      { phone: { $regex: emailOrPhone, $options: 'i' } }
    ]
  }).limit(5);
  
  return users.map(u => ({
    id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar
  }));
};

/**
 * createMinimalUser - Create a user with minimal details (Agent Assisted)
 */
import crypto from 'crypto';
import { addEmailJob } from '../../workers/email.queue';

export const createMinimalUser = async (data: { firstName: string; lastName: string; email: string; phone?: string }) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new CustomError('User with this email already exists', 400);

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  const user = await User.create({
    ...data,
    role: 'client',
    authProvider: 'manual',
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpiry: tokenExpiry,
    balance: 0
  });

  // Notify user to claim account
  const claimUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/onboarding?token=${verificationToken}`;
  await addEmailJob('AGENT_ASSISTED_WELCOME', {
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    claimUrl,
  });

  return user;
};
