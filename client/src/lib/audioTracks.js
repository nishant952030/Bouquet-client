export const MUSIC_TRACKS = [
  { id: "none", name: "No music", url: "", desc: "Silence" },
  { id: "acoustic", name: "Gentle Guitar", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", desc: "Warm & acoustic" },
  { id: "piano", name: "Sweet Piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", desc: "Soft & emotional" },
  { id: "lofi", name: "Lofi Vibe", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", desc: "Chill & relaxing" },
  { id: "chiptune", name: "Cute Chiptune", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", desc: "Playful 8-bit" }
];

let globalAudio = null;
let currentTrackId = "none";
let isMutedState = false;

export function getAudioInstance() {
  if (typeof window === "undefined") return null;
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.loop = true;
    globalAudio.crossOrigin = "anonymous";
  }
  return globalAudio;
}

export function playTrack(trackId) {
  const audio = getAudioInstance();
  if (!audio) return;
  
  if (trackId === "none" || !trackId) {
    stopTrack();
    return;
  }
  
  const track = MUSIC_TRACKS.find(t => t.id === trackId);
  if (!track) return;
  
  if (currentTrackId !== trackId) {
    audio.src = track.url;
    currentTrackId = trackId;
  }
  
  audio.muted = isMutedState;
  audio.play().catch(err => {
    console.warn("Autoplay blocked or audio error:", err);
  });
}

export function stopTrack() {
  const audio = getAudioInstance();
  if (audio) {
    audio.pause();
  }
}

export function setMuteState(muted) {
  isMutedState = muted;
  const audio = getAudioInstance();
  if (audio) {
    audio.muted = muted;
  }
}

export function getMuteState() {
  return isMutedState;
}

export function getCurrentTrackId() {
  return currentTrackId;
}
