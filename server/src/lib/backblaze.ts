import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'eu-central-003', // Backblaze region from .env
  endpoint: process.env.BACKBLAZE_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APP_KEY!,
  },
});

/**
 * Generates a pre-signed URL for uploading a file directly to Backblaze B2.
 */
export const generateUploadUrl = async (userId: string, filename: string, contentType: string) => {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const objectKey = `users/${userId}/applications/${timestamp}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

  return {
    uploadUrl,
    objectKey,
  };
};

/**
 * Generates a pre-signed URL for previewing/downloading a file from Backblaze B2.
 */
export const generatePreviewUrl = async (objectKey: string, expiresIn: number = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Key: objectKey,
  });

  const previewUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return previewUrl;
};

/**
 * Lists objects in a bucket with a specific prefix (folder).
 */
export const listObjects = async (prefix: string) => {
  const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
  const command = new ListObjectsV2Command({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);
  return response.Contents || [];
};

/**
 * Deletes a single object from Backblaze.
 */
export const deleteObject = async (objectKey: string) => {
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  const command = new DeleteObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Key: objectKey,
  });

  await s3Client.send(command);
};

/**
 * Deletes all objects with a specific prefix (recursive folder delete).
 */
export const deleteFolder = async (prefix: string) => {
  const { DeleteObjectsCommand } = await import('@aws-sdk/client-s3');
  const objects = await listObjects(prefix);
  
  if (objects.length === 0) return;

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Delete: {
      Objects: objects.map(obj => ({ Key: obj.Key! })),
    },
  });

  await s3Client.send(deleteCommand);
};

export { s3Client };
