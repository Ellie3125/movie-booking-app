/** Đường dẫn logo mặc định trên Backend (thư mục uploads dùng chung) */
export const DEFAULT_LOGO_PATH = "/uploads/logos/Logo.png";

export const buildImageUrl = (path?: string) => {
  if (!path) return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path><circle cx='12' cy='7' r='4'></circle></svg>"; // Default SVG avatar fallback
  if (path.startsWith("http")) return path;
  
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${baseUrl}${path}`;
};

/** Lấy URL đầy đủ của logo app mặc định */
export const getDefaultLogoUrl = () => buildImageUrl(DEFAULT_LOGO_PATH);
