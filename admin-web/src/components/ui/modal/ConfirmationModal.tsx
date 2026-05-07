import React from "react";
import { Modal } from "./index";
import Button from "../button/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "error" | "warning" | "info" | "success";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "warning",
}) => {
  const variantIcons = {
    warning: (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-[#F79009] dark:bg-[#F79009]/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor" />
        </svg>
      </div>
    ),
    error: (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-[#F04438] dark:bg-[#F04438]/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor" />
        </svg>
      </div>
    ),
    success: (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-[#12B76A] dark:bg-[#12B76A]/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11.003 16L6.76 11.757L8.174 10.343L11.003 13.172L15.833 8.343L17.247 9.757L11.003 16Z" fill="currentColor" />
        </svg>
      </div>
    ),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] p-6 text-center" showCloseButton={false}>
      <div className="flex flex-col items-center">
        {variantIcons[variant as keyof typeof variantIcons] || variantIcons.warning}
        
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>

        <div className="flex items-center justify-center w-full gap-3 mt-8">
          <Button variant="outline" onClick={onClose} className="flex-1 !px-4">
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'error' ? 'error' : variant === 'warning' ? 'warning' : variant === 'success' ? 'success' : 'primary'} 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className="flex-1 !px-4"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
