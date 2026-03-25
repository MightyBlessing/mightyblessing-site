type Props = { label: string };

export function Tag({ label }: Props) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-medium tracking-[0.02em] text-neutral-700">
      {label}
    </span>
  );
}
