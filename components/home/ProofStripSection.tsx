export function ProofStripSection() {
  return (
    <section className="relative overflow-hidden border-y border-neutral-800 bg-neutral-900 py-16 text-white sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[4.6rem] leading-none font-semibold tracking-[-0.08em] text-white/[0.05] uppercase sm:text-[7rem] lg:text-[11rem]"
      >
        Hebrews
      </div>
      <div className="container-wide relative text-center">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/48">함께 붙드는 말씀</p>
        <blockquote className="mx-auto max-w-[920px] text-[1.52rem] leading-[1.48] font-medium tracking-[-0.03em] text-white break-keep sm:text-[2.2rem]">
          &ldquo;그런즉 우리도 그의 치욕을 짊어지고 영문 밖으로 그에게 나아가자&rdquo;
        </blockquote>
        <p className="mt-5 text-[12px] font-medium tracking-[0.15em] text-violet-300">히브리서 13:13</p>
        <div className="mx-auto mt-8 h-px w-16 bg-white/16" />
      </div>
    </section>
  );
}
