/**
 * Client-safe YouTube utilities
 * Strictly free of server/database imports so it can be safely imported
 * into both client components and server routes.
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|live\/|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = url.trim().match(regExp);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(
  videoId: string,
  quality: "hq" | "maxres" = "hq"
): string {
  if (!videoId) return "";
  const prefix = quality === "maxres" ? "maxresdefault" : "hqdefault";
  return `https://img.youtube.com/vi/${videoId}/${prefix}.jpg`;
}
