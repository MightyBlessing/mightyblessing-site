type Props = { label: string };

export function Tag({ label }: Props) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-500">
      {label}
    </span>
  );
}
