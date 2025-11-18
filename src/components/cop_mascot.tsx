import Image from "next/image";

interface CopMascotProps {
  /** If true, displays the simon_cop.png image instead of the CSS mascot */
  reflect?: boolean;
}

export default function CopMascot({ reflect = false }: CopMascotProps) {
  return (
    <div className="self-end h-full flex items-end inset-0 z-3">
      <Image
        src="/simon_cop.png"
        alt="Simon the Cop"
        width={100}
        height={100}
        className={`h-full w-auto object-contain object-bottom ${
          reflect ? "scale-x-[-1]" : ""
        }`}
        priority
      />
    </div>
  );
}
