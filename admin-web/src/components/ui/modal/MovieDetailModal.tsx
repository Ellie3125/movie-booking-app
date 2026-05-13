import React from "react";
import { Modal } from "./index";
import Badge from "../badge/Badge";

interface MovieDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: any;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ isOpen, onClose, movie }) => {
  if (!movie) return null;

  // Helper to extract YouTube ID
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}` 
      : null;
  };

  const embedUrl = getYoutubeEmbedUrl(movie.trailerUrl);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-[850px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-none shadow-2xl">
      {/* Backdrop Area */}
      <div className="relative h-[300px] w-full bg-gray-900">
        {movie.backdropUrl ? (
          <img 
            src={movie.backdropUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover opacity-60" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-brand-900 to-gray-900" />
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
        
        {/* Poster & Basic Info Overlay */}
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="w-40 h-60 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="pb-4">
             <div className="flex flex-wrap gap-2 mb-3">
                {movie.genres?.map((g: string) => (
                   <span key={g} className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-md border border-white/30">
                     {g}
                   </span>
                ))}
             </div>
             <h2 className="text-4xl font-black text-gray-900 dark:text-white drop-shadow-sm mb-1 leading-tight">
               {movie.title}
             </h2>
             <div className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   {movie.duration} phút
                </span>
                <Badge color={movie.status === "now_showing" ? "success" : movie.status === "coming_soon" ? "warning" : "error"}>
                   {movie.status === "now_showing" ? "Đang chiếu" : movie.status === "coming_soon" ? "Sắp chiếu" : "Đã kết thúc"}
                </Badge>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 pb-10 px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {/* Left Info */}
           <div className="md:col-span-1 space-y-6">
              <div>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ngày khởi chiếu</p>
                 <p className="text-gray-900 dark:text-white font-bold text-lg">
                   {new Date(movie.releaseDate).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}
                 </p>
              </div>
              <div>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ngày kết thúc</p>
                 <p className="text-gray-700 dark:text-gray-400 font-medium">
                   {new Date(movie.endDate).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}
                 </p>
              </div>
              <div className="pt-4">
                 <button 
                   onClick={onClose}
                   className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                 >
                   Đóng
                 </button>
              </div>
           </div>

           {/* Right Content / Trailer */}
           <div className="md:col-span-2 space-y-6">
              <div>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Trailer chính thức</p>
                 {embedUrl ? (
                   <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-100 dark:border-white/10">
                      <iframe 
                        src={embedUrl}
                        title={`${movie.title} Trailer`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                   </div>
                 ) : (
                   <div className="aspect-video w-full rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700">
                      Chưa có trailer
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </Modal>
  );
};
