interface AlertPopupProps {
  message: string;
  countdown: number | null;
  isAlarmActive: boolean;
  onClose: () => void;
}

export default function AlertPopup({
  message,
  countdown,
  isAlarmActive,
  onClose,
}: AlertPopupProps) {
  const bgColor = isAlarmActive
    ? "bg-red-600"
    : countdown !== null && countdown <= 2
    ? "bg-orange-600"
    : "bg-yellow-600";

  const animationClass = isAlarmActive ? "animate-pulse" : "";

  return (
    <div
      className={`${bgColor} ${animationClass} text-white px-8 py-4 rounded-full shadow-2xl relative`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 bg-slate-800 hover:bg-slate-900 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-sm"
        aria-label="Close"
      >
        ×
      </button>
      <p className="text-xl font-bold">{message}</p>
    </div>
  );
}
