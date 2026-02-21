type Props = { label: string };

export function Tag({ label }: Props) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
      {label}
    </span>
  );
}
