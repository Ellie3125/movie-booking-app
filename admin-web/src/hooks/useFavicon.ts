import { useEffect } from "react";

/**
 * Hook để cập nhật favicon động.
 * Có thể sử dụng khi logo rạp thay đổi hoặc cần cập nhật favicon
 * từ dữ liệu API (ví dụ: logo CinemaBrand).
 *
 * @param faviconUrl - URL tuyệt đối hoặc relative path đến file favicon
 *
 * @example
 * // Sử dụng với URL tĩnh
 * useFavicon("/favicon.png");
 *
 * @example
 * // Sử dụng với URL từ API backend
 * const logoUrl = buildImageUrl(brand?.logo);
 * useFavicon(logoUrl);
 */
export function useFavicon(faviconUrl?: string) {
  useEffect(() => {
    if (!faviconUrl) return;

    const updateFavicon = (url: string) => {
      // Tìm thẻ link favicon hiện tại
      let link: HTMLLinkElement | null = document.querySelector(
        "link[rel*='icon']"
      );

      if (!link) {
        // Nếu không tìm thấy, tạo thẻ mới
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      // Xác định MIME type dựa trên extension
      const extension = url.split(".").pop()?.toLowerCase();
      switch (extension) {
        case "svg":
          link.type = "image/svg+xml";
          break;
        case "ico":
          link.type = "image/x-icon";
          break;
        case "png":
          link.type = "image/png";
          break;
        default:
          link.type = "image/png";
      }

      link.href = url;
    };

    updateFavicon(faviconUrl);
  }, [faviconUrl]);
}
