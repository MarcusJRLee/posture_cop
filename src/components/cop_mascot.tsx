export default function CopMascot() {
  return (
    <div className="relative inline-block">
      {/* Police Hat */}
      <div className="relative">
        {/* Hat top */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-blue-900 rounded-t-lg"></div>
        {/* Hat brim */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-blue-950 rounded-full shadow-lg"></div>
        {/* Hat badge */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center">
          <div className="w-2 h-2 bg-yellow-600 rounded-sm"></div>
        </div>
      </div>

      {/* Head */}
      <div className="w-16 h-16 bg-amber-100 rounded-full border-4 border-amber-200 relative">
        {/* Aviator Sunglasses */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex gap-1">
          {/* Left lens */}
          <div className="relative">
            <div className="w-5 h-4 bg-black rounded-full"></div>
            <div className="absolute top-0.5 left-0.5 w-2 h-1.5 bg-gray-800 rounded-full opacity-50"></div>
          </div>
          {/* Bridge */}
          <div className="w-1 h-1 bg-black self-center"></div>
          {/* Right lens */}
          <div className="relative">
            <div className="w-5 h-4 bg-black rounded-full"></div>
            <div className="absolute top-0.5 left-0.5 w-2 h-1.5 bg-gray-800 rounded-full opacity-50"></div>
          </div>
        </div>

        {/* Mustache */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-0.5">
          {/* Left side */}
          <div className="w-5 h-3 bg-black rounded-full transform rotate-12"></div>
          {/* Right side */}
          <div className="w-5 h-3 bg-black rounded-full transform -rotate-12"></div>
        </div>

        {/* Nose */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-200 rounded-full"></div>
      </div>
    </div>
  );
}
