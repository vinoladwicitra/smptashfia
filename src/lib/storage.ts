import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: import.meta.env.VITE_SUPABASE_STORAGE_REGION || 'ap-southeast-1',
  endpoint: import.meta.env.VITE_SUPABASE_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_SUPABASE_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_SUPABASE_STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'smptashfia';
const AVATAR_FOLDER = 'avatars';

/**
 * Upload avatar to Supabase Storage (S3 compatible)
 * Returns the public URL of the uploaded file
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${AVATAR_FOLDER}/${userId}/avatar.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: arrayBuffer,
    ContentType: file.type,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  // Construct public URL
  const baseUrl = import.meta.env.VITE_SUPABASE_STORAGE_ENDPOINT?.replace('/storage/v1/s3', '');
  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${key}`;
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(userId: string): Promise<void> {
  // Try to delete all possible avatar extensions
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  
  for (const ext of extensions) {
    const key = `${AVATAR_FOLDER}/${userId}/avatar.${ext}`;
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }));
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

/**
 * Get current avatar URL for a user
 */
export function getAvatarUrl(userId: string, format: string = 'webp'): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_STORAGE_ENDPOINT?.replace('/storage/v1/s3', '');
  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${AVATAR_FOLDER}/${userId}/avatar.${format}`;
}
