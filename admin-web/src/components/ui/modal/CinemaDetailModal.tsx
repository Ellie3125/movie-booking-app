import React from "react";
import { Modal } from "./index";
import { buildImageUrl } from "../../../utils/imageUrl";

interface CinemaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cinema: any;
  brandInfo: any;
}

export const CinemaDetailModal: React.FC<CinemaDetailModalProps> = ({ isOpen, onClose, cinema, brandInfo }) => {
  if (!cinema) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-[600px] p-0 overflow-hidden bg-gray-50 dark:bg-gray-900 border-none">
      {/* Header with Image/Poster */}
      <div className="relative h-56 w-full bg-gray-200 dark:bg-gray-800">
        {cinema.imageUrl ? (
          <img 
            src={buildImageUrl(cinema.imageUrl)} 
            alt={cinema.name} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <span className="text-sm font-medium">Không có ảnh rạp</span>
          </div>
        )}
        
        {/* Brand Logo Overlay */}
        <div className="absolute -bottom-10 left-8 p-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl overflow-hidden p-2">
            <img 
              src={buildImageUrl(cinema.imageUrl || brandInfo.logoUrl)} 
              alt={brandInfo.name} 
              className="max-w-full max-h-full object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-16 pb-10 px-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase rounded-md tracking-wider">
               {brandInfo.name}
             </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {cinema.name}
          </h2>
        </div>

        <div className="space-y-8">
          {/* Address Block */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Địa chỉ rạp</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-lg leading-snug">
                {cinema.address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Area Block */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Khu vực</p>
                <p className="text-gray-700 dark:text-gray-300 font-bold text-lg">{cinema.city || cinema.province}</p>
              </div>
            </div>

            {/* Hotline Block */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hotline</p>
                <p className="text-gray-700 dark:text-gray-300 font-bold text-lg">{cinema.phone || "Đang cập nhật"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
