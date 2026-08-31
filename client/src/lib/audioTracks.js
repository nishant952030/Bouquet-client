export const MUSIC_TRACKS = [
  { id: "none", name: "No music", url: "", desc: "Silence" },
  {
    id: "acoustic",
    name: "Gentle Guitar",
    url: "/music/acoustic.mp3",
    desc: "Warm & acoustic",
  },
  {
    id: "piano",
    name: "Sweet Piano",
    url: "/music/piano.mp3",
    desc: "Soft & emotional",
  },
  {
    id: "lofi",
    name: "Lofi Vibe",
    url: "/music/lofi.mp3",
    desc: "Chill & relaxing",
  },
  {
    id: "chiptune",
    name: "Cute Chiptune",
    url: "/music/chiptune.mp3",
    desc: "Playful 8-bit",
  },
];

let globalAudio = null;
let currentTrackId = "none";
let isMutedState = false;
let playPromise = null;

export function getAudioInstance() {
  if (typeof window === "undefined") return null;
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.loop = true;
    globalAudio.crossOrigin = "anonymous";
    globalAudio.preload = "auto";
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

  const track = MUSIC_TRACKS.find((t) => t.id === trackId);
  if (!track || !track.url) return;

  if (currentTrackId !== trackId) {
    audio.src = track.url;
    currentTrackId = trackId;
  }

  audio.muted = isMutedState;

  const startPlay = () => {
    try {
      playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            playPromise = null;
          })
          .catch((err) => {
            playPromise = null;
            if (err.name !== "AbortError") {
              console.warn("Autoplay blocked or audio notice:", err.message);
            }
          });
      }
    } catch {
      playPromise = null;
    }
  };

  if (playPromise !== null) {
    playPromise
      .then(startPlay)
      .catch(startPlay);
  } else {
    startPlay();
  }
}

export function stopTrack() {
  const audio = getAudioInstance();
  if (audio) {
    if (playPromise !== null) {
      playPromise
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }
  currentTrackId = "none";
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
