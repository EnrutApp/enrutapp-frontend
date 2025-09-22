import { createPortal } from 'react-dom'
import { useEffect } from 'react'

const Modal = ({ isOpen, onClose, children, size = 'md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh'
            }}
        >
            <div
                className="absolute inset-0 bg-black  opacity-30"
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%'
                }}
            />

            <div className={`relative bg-fill rounded-3xl ${size === 'lg' ? 'max-w-2xl' : size === 'xl' ? 'max-w-4xl' : 'max-w-md'} w-full mx-4 transform transition-all duration-200 z-10`}>
                {children}
            </div>
        </div>,
        document.body
    )
}

export default Modal
