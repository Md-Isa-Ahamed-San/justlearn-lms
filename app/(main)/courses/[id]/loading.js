import { cn } from "@/lib/utils";

export default function LoadingCoursePage() {
  const logoText = "JUSTLearn";

  return (
    <div className="flex items-center justify-center w-full min-h-[70dvh] max-h-[70dvh]">
      <div className={cn("flex flex-col items-center")}>
        <div className="relative w-16 h-16 mt-28">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white font-bold text-xl">
            {logoText.charAt(0)}
          </div>
        </div>

        <div className="text-2xl md:text-3xl lg:text-4xl font-bold mt-8">
          {logoText.split("").map((letter, i) => (
            <span
              key={i}
              className="inline-block animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "1s",
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
