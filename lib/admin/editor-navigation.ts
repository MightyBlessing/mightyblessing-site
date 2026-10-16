/** Capture before Next Link handles client-side navigation. New tabs keep the editor open. */
export function guardEditorNavigation(event: MouseEvent, currentUrl: string, confirmLeave: () => boolean) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
  const next = new URL(anchor.href, currentUrl);
  const current = new URL(currentUrl);
  if (!/^https?:$/.test(next.protocol) || (next.origin === current.origin && next.pathname === current.pathname && next.search === current.search)) return;
  if (!confirmLeave()) { event.preventDefault(); event.stopPropagation(); }
}
