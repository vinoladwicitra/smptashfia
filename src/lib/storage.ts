import { supabase } from './supabase';

const BUCKET = 'smptashfia';
const AVATAR_FOLDER = 'avatars';

/**
 * Upload file to Supabase Storage (no S3 credentials needed)
 * Returns the public URL of the uploaded file
 */
export async function uploadToStorage(key: string, file: File): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(key);

  return publicUrl;
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${AVATAR_FOLDER}/${userId}/avatar.${ext}`;
  return uploadToStorage(key, file);
}

/**
 * Delete avatar from storage
 */
export async function deleteAvatar(userId: string): Promise<void> {
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  
  const filesToDelete = extensions.map(ext => `${AVATAR_FOLDER}/${userId}/avatar.${ext}`);
  
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove(filesToDelete);

  // Ignore "not found" errors
  if (error && !error.message.includes('not found')) throw error;
}
