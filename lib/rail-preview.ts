export type RailPreview = { requested?: string; shown?: string; ready: string[]; failed: string[] };
export type RailPreviewAction = { type: "select" | "loaded" | "error"; slug: string; hasImage?: boolean };

// The caption follows the displayed image; late loads cannot replace a newer request.
export function railPreviewReducer(state: RailPreview, action: RailPreviewAction): RailPreview {
  if (action.type === "select") return {
    ...state, requested: action.slug,
    shown: action.hasImage === false ? undefined : state.ready.includes(action.slug) ? action.slug : state.failed.includes(action.slug) ? undefined : state.shown,
  };
  if (action.type === "loaded") return {
    ...state, ready: [...state.ready.filter((slug) => slug !== action.slug), action.slug],
    failed: state.failed.filter((slug) => slug !== action.slug),
    shown: state.requested === action.slug ? action.slug : state.shown,
  };
  return {
    ...state, failed: [...state.failed.filter((slug) => slug !== action.slug), action.slug],
    ready: state.ready.filter((slug) => slug !== action.slug),
    shown: state.requested === action.slug || state.shown === action.slug ? undefined : state.shown,
  };
}
