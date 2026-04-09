/**
 * Format date to Indonesian locale
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format view count (e.g., 1500 → 1.5rb)
 */
export function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}rb`;
  return n.toString();
}

/**
 * Scroll to top of page with smooth animation
 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Blog category badge colors
 */
export const blogCategoryColors: Record<string, string> = {
  'kegiatan': 'bg-green-100 text-green-700 ring-green-600/20',
  'edukasi': 'bg-blue-100 text-blue-700 ring-blue-600/20',
  'literasi-digital': 'bg-purple-100 text-purple-700 ring-purple-600/20',
  'akademik': 'bg-amber-100 text-amber-700 ring-amber-600/20',
  'pengumuman': 'bg-rose-100 text-rose-700 ring-rose-600/20',
};

/**
 * Estimate reading time from HTML content (words per minute)
 */
export function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
