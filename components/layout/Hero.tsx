import Image from "next/image";

export function Hero({ compact = false }: { compact?: boolean }) {
  return (
    <header
      className={`relative z-10 border-b border-gold/25 text-center ${compact ? "py-8" : "py-12 md:py-16"}`}
    >
      <div
        className={`relative mx-auto ${compact ? "h-20 w-20" : "h-32 w-32 md:h-40 md:w-40"}`}
      >
        <Image
          src="/logo.png"
          alt="Peladinhas da Invicta"
          fill
          sizes={compact ? "80px" : "(max-width: 768px) 128px, 160px"}
          className="object-contain drop-shadow-[0_8px_32px_rgba(245,200,66,0.3)]"
          priority
        />
      </div>
      <h1
        className={`font-display leading-none tracking-wide text-text-primary ${compact ? "mt-4 text-4xl" : "mt-6 text-5xl md:text-7xl"}`}
      >
        Peladinhas
        <span className="block text-gold">da Invicta</span>
      </h1>
      <div className="mx-auto my-4 h-0.5 w-14 bg-gradient-to-r from-transparent via-gold to-transparent" />
      <p className="font-condensed text-sm tracking-[0.25em] text-text-secondary uppercase">
        Porto · ISEP
      </p>
    </header>
  );
}
