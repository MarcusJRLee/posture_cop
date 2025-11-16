interface AlertPopupProps {
  message: string;
  onClose: () => void;
}

export default function AlertPopup({ message, onClose }: AlertPopupProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      onClick={onClose}
    >
      <div
        className="bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl animate-pulse pointer-events-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-red-800 hover:bg-red-900 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-sm"
          aria-label="Close"
        >
          ×
        </button>
        <p className="text-xl font-bold">{message}</p>
      </div>
    </div>
  );
}
