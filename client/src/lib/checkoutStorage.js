export const CHECKOUT_DRAFT_KEY = "pw_checkout_draft";

function isValidStems(stems) {
  return Array.isArray(stems);
}

export function loadCheckoutDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidStems(parsed?.stems)) return null;
    return {
      stems: parsed.stems,
      note: typeof parsed.note === "string" ? parsed.note : "",
      senderName: typeof parsed.senderName === "string" ? parsed.senderName : "",
      musicTrack: typeof parsed.musicTrack === "string" ? parsed.musicTrack : "none",
      voiceNote: typeof parsed.voiceNote === "string" ? parsed.voiceNote : null,
    };
  } catch {
    return null;
  }
}

export function saveCheckoutDraft({ stems, note, senderName = "", musicTrack = "none", voiceNote = null }) {
  if (typeof window === "undefined" || !isValidStems(stems)) return;
  localStorage.setItem(
    CHECKOUT_DRAFT_KEY,
    JSON.stringify({
      stems,
      note: typeof note === "string" ? note : "",
      senderName: typeof senderName === "string" ? senderName : "",
      musicTrack: typeof musicTrack === "string" ? musicTrack : "none",
      voiceNote: typeof voiceNote === "string" ? voiceNote : null,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function clearCheckoutDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHECKOUT_DRAFT_KEY);
}
