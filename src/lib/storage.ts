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

/**
 * Upload blog image (featured or content)
 * Uses blog folder with SEO-friendly naming
 */
export async function uploadBlogImage(userId: string, purpose: 'featured' | 'content', file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const key = `blog/${purpose}/${purpose}-${userId}-${timestamp}.${ext}`;
  return uploadToStorage(key, file);
}

/**
 * Delete blog images from storage when article is deleted
 */
export async function deleteBlogImages(contentHtml: string): Promise<void> {
  const keys: string[] = [];

  // Extract content image paths
  const contentImgRegex = /\/blog\/content\/[^"'?]+/g;
  let match;
  while ((match = contentImgRegex.exec(contentHtml)) !== null) {
    keys.push(match[0]);
  }

  if (keys.length > 0) {
    const { error } = await supabase.storage.from(BUCKET).remove(keys);
    if (error && !error.message.includes('not found')) {
      console.warn('Storage delete warning:', error.message);
    }
  }
}

/**
 * Upload facility image
 * Stores in 'facilities' bucket with category folder structure
 */
export async function uploadFacilityImage(categoryId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const safeExt = allowedExts.includes(ext) ? ext : 'jpg';
  const timestamp = Date.now();
  const key = `facilities/${categoryId}/${timestamp}.${safeExt}`;

  const { error } = await supabase.storage
    .from('facilities')
    .upload(key, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('facilities')
    .getPublicUrl(key);

  return publicUrl;
}

/**
 * Delete a single facility image from storage
 * Accepts either full public URL or storage key
 */
export async function deleteFacilityImage(imageUrlOrKey: string): Promise<void> {
  let key = imageUrlOrKey;

  // If full URL, extract the key part
  const match = imageUrlOrKey.match(/\/object\/public\/facilities\/(.+)/);
  if (match) {
    key = match[1];
  } else if (imageUrlOrKey.startsWith('facilities/')) {
    key = imageUrlOrKey;
  } else {
    // Not a facilities image path, skip
    console.warn('Invalid facility image path:', imageUrlOrKey);
    return;
  }

  const { error } = await supabase.storage
    .from('facilities')
    .remove([key]);

  // Ignore "not found" errors
  if (error && !error.message.includes('not found')) {
    console.warn('Failed to delete facility image:', error.message);
  }
}

/**
 * Delete all images for a facility category
 */
export async function deleteFacilityImagesByCategory(categoryId: string): Promise<void> {
  const { data: files } = await supabase.storage
    .from('facilities')
    .list(categoryId);

  if (files && files.length > 0) {
    const keys = files.map(f => `${categoryId}/${f.name}`);
    const { error } = await supabase.storage.from('facilities').remove(keys);
    if (error && !error.message.includes('not found')) {
      console.warn('Failed to delete facility images:', error.message);
    }
  }
}
