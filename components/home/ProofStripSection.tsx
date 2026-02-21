export function ProofStripSection() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-gray-100 py-20 dark:bg-black">
      <div className="absolute inset-0 bg-[#6A00FF]/5 dark:bg-[#6A00FF]/10" />
      <div className="relative z-10 max-w-4xl px-6 text-center">
        <span className="material-icons-outlined mb-4 text-4xl text-[#6A00FF] opacity-50" aria-hidden>
          format_quote
        </span>
        <blockquote className="mb-4 text-xl font-medium italic text-[#111111] dark:text-[#EEEEEE] md:text-2xl">
          &ldquo;그런즉 우리도 그의 치욕을 짊어지고 영문 밖으로 그에게 나아가자&rdquo;
        </blockquote>
        <p className="text-sm font-bold uppercase tracking-widest text-[#666666] dark:text-[#AAAAAA]">
          — Hebrews 13:13
        </p>
      </div>
    </section>
  );
}
