function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Glassy overlay with very subtle blur */}
      <div className="absolute inset-0 bg-gray-900/70 dark:bg-gray-900/90 backdrop-blur-sm transition-opacity duration-300" />
      {/* Animated gradient border ring */}
      <div className="absolute z-10 w-[410px] max-w-[95vw] h-[410px] max-h-[95vh] rounded-[2.5rem] pointer-events-none animate-gradient-ring" style={{background: 'conic-gradient(from 180deg at 50% 50%, #60a5fa 0%, #2563eb 100%, #60a5fa 100%)', opacity: 0.18}}></div>
      {/* Modal popup */}
      <div className="glass-bg border-2 border-transparent bg-clip-padding rounded-[2.2rem] shadow-2xl p-10 min-w-[340px] max-w-[95vw] relative z-20 animate-fadein-modal transition-all duration-300 flex flex-col items-center" style={{ boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.18)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl w-10 h-10 flex items-center justify-center rounded-full glass-bg shadow-lg hover:ring-2 hover:ring-blue-400/40 hover:scale-110 hover:text-blue-600 transition-all duration-200">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal; 