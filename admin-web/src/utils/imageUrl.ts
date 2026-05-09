export const buildImageUrl = (path?: string) => {
  if (!path) return "/images/user/owner.jpg"; // Default fallback
  if (path.startsWith("http")) return path;
  
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${baseUrl}${path}`;
};
