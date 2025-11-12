import { createPortal } from 'react-dom';
import { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlay = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-7xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-overlay"
      style={{
        zIndex: 9999,
      }}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={closeOnOverlay ? onClose : undefined}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <div
        className={`relative bg-black border border-border rounded-3xl shadow-2xl ${sizeClasses[size] || sizeClasses.md} w-full mx-auto modal-content`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
