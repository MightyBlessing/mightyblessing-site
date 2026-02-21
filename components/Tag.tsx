type Props = { label: string };

export function Tag({ label }: Props) {
  return (
    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-[#666666] dark:bg-gray-800 dark:text-[#AAAAAA]">
      {label}
    </span>
  );
}
