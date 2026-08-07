/**
 * Hand-crafted Lottie animation data for virtual pets.
 * 4 pet types × 4 states = fully self-contained, no CDN dependency.
 *
 * Canvas: 400×400
 * Coordinate origin: top-left
 */

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const st = (k) => ({ a: 0, k });                               // static value
const ease = (t, s) => ({
  i: { x: [0.5, 0.5, 0.5], y: [1, 1, 1] },
  o: { x: [0.5, 0.5, 0.5], y: [0, 0, 0] },
  t, s,
});
const last = (t, s) => ({ t, s });

// ─── colour palettes ──────────────────────────────────────────────────────────
const PAL = {
  puppy: {
    body:   [0.831, 0.529, 0.353],   // #D4875A warm tan
    ear:    [0.655, 0.384, 0.216],   // #A76237 dark tan
    belly:  [0.969, 0.843, 0.718],   // #F7D7B7 light tan
    pupil:  [0.176, 0.094, 0.059],   // #2D1810 dark brown
    nose:   [0.220, 0.118, 0.086],   // #381E16
    mouth:  [0.220, 0.118, 0.086],
    blush:  [0.961, 0.710, 0.647],   // #F5B5A5 pink
  },
  kitten: {
    body:   [0.914, 0.647, 0.388],   // #E9A563 orange
    ear:    [0.765, 0.467, 0.216],   // #C37737
    belly:  [1.000, 0.922, 0.816],   // #FFEBCF cream
    pupil:  [0.125, 0.361, 0.161],   // #205C29 green
    nose:   [0.859, 0.365, 0.396],   // #DB5D65 pink nose
    mouth:  [0.580, 0.188, 0.216],   // #941E37
    blush:  [0.953, 0.580, 0.612],   // #F3939C
  },
  panda: {
    body:   [0.937, 0.937, 0.937],   // #EFEFEF white
    ear:    [0.196, 0.196, 0.196],   // #323232 black
    belly:  [0.937, 0.937, 0.937],
    pupil:  [0.196, 0.196, 0.196],
    nose:   [0.196, 0.196, 0.196],
    mouth:  [0.196, 0.196, 0.196],
    blush:  [1.000, 0.820, 0.855],   // light pink
    patch:  [0.196, 0.196, 0.196],   // black eye patches
  },
  bunny: {
    body:   [0.988, 0.878, 0.906],   // #FCE0E7 pink-white
    ear:    [0.957, 0.718, 0.773],   // #F4B7C5 pink
    belly:  [1.000, 0.953, 0.961],   // #FFF3F5
    pupil:  [0.416, 0.102, 0.447],   // #6A1A72 purple
    nose:   [0.965, 0.502, 0.576],   // #F68093 pink
    mouth:  [0.741, 0.267, 0.400],   // #BD4466
    blush:  [0.965, 0.718, 0.773],   // #F6B7C5
  },
};

// ─── layer factory ────────────────────────────────────────────────────────────
function layer(ind, nm, px, py, shapes, {
  rot = 0, op = 100, totalFrames = 90,
  sAnim = null, pAnim = null,
} = {}) {
  return {
    ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, bm: 0,
    ip: 0, op: totalFrames, st: 0,
    ks: {
      o: st(op),
      r: st(rot),
      p: pAnim ?? st([px, py, 0]),
      a: st([0, 0, 0]),
      s: sAnim ?? st([100, 100, 100]),
    },
    shapes,
  };
}

// ─── shape helpers ────────────────────────────────────────────────────────────
const el = (w, h)      => ({ ty: 'el', nm: 'el', p: st([0,0]), s: st([w,h]), d: 1 });
const fl = (rgb, o=100)=> ({ ty: 'fl', nm: 'fl', c: st([...rgb,1]), o: st(o), r: 1, bm: 0 });
const sk = (rgb, w=4)  => ({ ty: 'st', nm: 'st', c: st([...rgb,1]), o: st(100), w: st(w), lc: 2, lj: 2, bm: 0 });
const ph = (v,i,o,closed=false) => ({ ty:'sh',nm:'sh', ks: st({v,i,o,c:closed}), d:1 });

// Bezier control shorthand helpers:
// Smile path  (U-shape opening up) — lower y = higher on screen
function smilePath() {
  // Three-point quadratic bezier approximated in cubic
  // left (-22, 2) → bottom (0, 14) → right (22, 2)
  return ph(
    [[-22, 2], [0, 14], [22, 2]],
    [[0, 0], [-10, 0], [0, 0]],
    [[10, 0], [0, 0], [-10, 0]],
    false
  );
}
function sadPath() {
  // Inverted: left (-22, 12) → top (0, 2) → right (22, 12)
  return ph(
    [[-22, 12], [0, 2], [22, 12]],
    [[0, 0], [-10, 0], [0, 0]],
    [[10, 0], [0, 0], [-10, 0]],
    false
  );
}
function neutralPath() {
  // Flat line with slight upward curve
  return ph(
    [[-18, 8], [0, 10], [18, 8]],
    [[0, 0], [-8, 0], [0, 0]],
    [[8, 0], [0, 0], [-8, 0]],
    false
  );
}
function grimacePath() {
  // Zigzag / wavy line
  return ph(
    [[-18, 8], [-8, 4], [0, 10], [8, 4], [18, 8]],
    [[0,0],[-4,0],[0,0],[-4,0],[0,0]],
    [[4,0],[0,0],[4,0],[0,0],[4,0]],
    false
  );
}

// ─── eye blink animation ──────────────────────────────────────────────────────
function blinkScale(f, blinkAt = 63, totalFrames = 90) {
  // squeeze eye Y from 100% → 5% → 100% over 8 frames centered on blinkAt
  return {
    a: 1,
    k: [
      ease(0, [100, 100, 100]),
      ease(blinkAt - 3, [100, 100, 100]),
      ease(blinkAt,     [100, 5,   100]),
      ease(blinkAt + 3, [100, 100, 100]),
      last(totalFrames, [100, 100, 100]),
    ],
  };
}

// ─── breathing scale ─────────────────────────────────────────────────────────
function breatheScale(frames, lo = 97, hi = 103) {
  const mid = Math.round(frames / 2);
  return {
    a: 1,
    k: [
      ease(0,      [100, lo,  100]),
      ease(mid,    [100, hi,  100]),
      last(frames, [100, lo,  100]),
    ],
  };
}

// breathing position (head floats with chest)
function breathePos(px, py, dy, frames) {
  const mid = Math.round(frames / 2);
  return {
    a: 1,
    k: [
      ease(0,      [px, py,     0]),
      ease(mid,    [px, py - dy, 0]),
      last(frames, [px, py,     0]),
    ],
  };
}

// shake position (sick tremor)
function shakePos(px, py, frames) {
  const keys = [];
  for (let t = 0; t < frames; t += 3) {
    const dx = (t % 6 === 0) ? 4 : -4;
    keys.push(ease(t, [px + dx, py, 0]));
  }
  keys.push(last(frames, [px, py, 0]));
  return { a: 1, k: keys };
}

// bounce position (happy vertical)
function bouncePos(px, py, frames) {
  const mid = Math.round(frames / 2);
  return {
    a: 1,
    k: [
      ease(0,      [px, py,      0]),
      ease(mid,    [px, py - 12, 0]),
      last(frames, [px, py,      0]),
    ],
  };
}

// ─── build all layers for a given pet + state ─────────────────────────────────
function buildLayers(c, state, f) {
  const isHappy   = state === 'happy';
  const isHungry  = state === 'hungry';
  const isSick    = state === 'sick';

  const bScale = isHappy
    ? breatheScale(f, 96, 107)
    : isSick
      ? breatheScale(f, 99, 101)
      : isHungry
        ? breatheScale(f, 96, 100)
        : breatheScale(f, 97, 103);

  const bodyPosAnim = isSick
    ? shakePos(200, 295, f)
    : isHappy
      ? bouncePos(200, 295, f)
      : breathePos(200, 295, 4, f);

  const headPosAnim = isSick
    ? shakePos(200, 185, f)
    : isHappy
      ? bouncePos(200, 185, f)
      : breathePos(200, 185, 3, f);

  const nosePosAnim = isSick
    ? shakePos(200, 213, f)
    : breathePos(200, 213, 2, f);

  const mouthPosAnim = isSick
    ? shakePos(200, 233, f)
    : breathePos(200, 233, 2, f);

  const mouthPath = isHappy  ? smilePath()
    : isHungry || isSick     ? sadPath()
    : neutralPath();

  const blinkAnim = (isSick || isHappy)
    ? null           // sick/happy eyes stay open
    : blinkScale(null, Math.round(f * 0.7), f);

  const eyeScaleL = blinkAnim ?? st([100, 100, 100]);
  const eyeScaleR = blinkAnim ?? st([100, 100, 100]);

  // Sick eyes show X marks — we draw two crossed lines using opacity
  const eyeOpSick = isSick ? 0 : 100;
  const sickEyeOpacity = isSick ? 100 : 0;

  const layers = [];
  let idx = 1;

  // ── Tail (wagging ellipse behind body) ──────────────────────────────────────
  layers.push({
    ddd: 0, ind: idx++, ty: 4, nm: 'Tail',
    sr: 1, ao: 0, bm: 0, ip: 0, op: f, st: 0,
    ks: {
      o: st(90),
      r: {
        a: 1,
        k: [
          ease(0,  isHappy ? -25 : -10),
          ease(Math.round(f / 2), isHappy ? 25 : 10),
          last(f, isHappy ? -25 : -10),
        ],
      },
      p: st([290, 310, 0]),
      a: st([0, -28, 0]),
      s: st([100, 100, 100]),
    },
    shapes: [
      el(22, 56),
      fl(c.ear),
    ],
  });

  // ── Body (breathing) ────────────────────────────────────────────────────────
  layers.push(layer(idx++, 'Body', 200, 295, [el(230, 190), fl(c.body)], {
    totalFrames: f, sAnim: bScale, pAnim: bodyPosAnim,
  }));

  // ── Belly patch ─────────────────────────────────────────────────────────────
  layers.push(layer(idx++, 'Belly', 200, 305, [el(130, 105), fl(c.belly)], {
    totalFrames: f, pAnim: bodyPosAnim,
  }));

  // ── Left Ear ────────────────────────────────────────────────────────────────
  layers.push(layer(idx++, 'LeftEar', 148, 110, [el(50, 70), fl(c.ear)], {
    rot: -22, totalFrames: f,
  }));

  // ── Right Ear ───────────────────────────────────────────────────────────────
  layers.push(layer(idx++, 'RightEar', 252, 110, [el(50, 70), fl(c.ear)], {
    rot: 22, totalFrames: f,
  }));

  // ── Inner ear (bunny/kitten only) ───────────────────────────────────────────
  if (c.earInner) {
    layers.push(layer(idx++, 'LeftEarInner', 148, 118, [el(26, 42), fl(c.earInner)], {
      rot: -22, totalFrames: f,
    }));
    layers.push(layer(idx++, 'RightEarInner', 252, 118, [el(26, 42), fl(c.earInner)], {
      rot: 22, totalFrames: f,
    }));
  }

  // ── Head ────────────────────────────────────────────────────────────────────
  layers.push(layer(idx++, 'Head', 200, 185, [el(195, 195), fl(c.body)], {
    totalFrames: f, pAnim: headPosAnim,
  }));

  // ── Panda eye patches ───────────────────────────────────────────────────────
  if (c.patch) {
    layers.push(layer(idx++, 'PatchL', 167, 181, [el(52, 48), fl(c.patch)], {
      totalFrames: f, pAnim: breathePos(167, 181, 2, f),
    }));
    layers.push(layer(idx++, 'PatchR', 233, 181, [el(52, 48), fl(c.patch)], {
      totalFrames: f, pAnim: breathePos(233, 181, 2, f),
    }));
  }

  // ── Left Eye ────────────────────────────────────────────────────────────────
  layers.push({
    ddd: 0, ind: idx++, ty: 4, nm: 'LeftEye',
    sr: 1, ao: 0, bm: 0, ip: 0, op: f, st: 0,
    ks: {
      o: st(eyeOpSick),
      r: st(0),
      p: breathePos(170, 178, 2, f),
      a: st([0, 0, 0]),
      s: eyeScaleL,
    },
    shapes: [
      el(34, 34), fl([1, 1, 1]),          // white
    ],
  });
  layers.push({
    ddd: 0, ind: idx++, ty: 4, nm: 'LeftPupil',
    sr: 1, ao: 0, bm: 0, ip: 0, op: f, st: 0,
    ks: {
      o: st(eyeOpSick),
      r: st(0),
      p: breathePos(173, 180, 2, f),
      a: st([0, 0, 0]),
      s: eyeScaleL,
    },
    shapes: [
      el(16, 18), fl(c.pupil),
    ],
  });
  // Eye shine (left)
  layers.push({
    ddd: 0, ind: idx++, ty: 4, nm: 'ShineL',
    sr: 1, ao: 0, bm: 0, ip: 0, op: f, st: 0,
    ks: {
      o: st(eyeOpSick),
      r: st(0),
      p: breathePos(165, 174, 2, f),
      a: st([0, 0, 0]),
      s: st([100, 100, 100]),
    },
    shapes: [el(7, 7), fl([1, 1, 1])],
  });

  // ── Right Eye ───────────────────────────────────────────────────────────────
  layers.push({
    ddd: 0, ind: idx++, ty: 4, nm: 'RightEye',
    sr: 1, ao: 0, bm: 0, ip: 0, op: f, st: 0,
    ks: {
      o: st(eyeOpSick),
      r: st(0),
      p: breathePos(230, 178, 2, f),
      a: st([0, 0, 0]),
      s: eyeScaleR,
    },
    shapes: [el(34, 34), fl([1, 1, 1])],
  });
  layers.push({
    ddd: 0, ind: idx++, ty: 4, nm: 'RightPupil',
    sr: 1, ao: 0, bm: 0, ip: 0, op: f, st: 0,
    ks: {
      o: st(eyeOpSick),
      r: st(0),
      p: breathePos(233, 180, 2, f),
      a: st([0, 0, 0]),
      s: eyeScaleR,
    },
    shapes: [el(16, 18), fl(c.pupil)],
  });
  layers.push({
    ddd: 0, ind: idx++, ty: 4, nm: 'ShineR',
    sr: 1, ao: 0, bm: 0, ip: 0, op: f, st: 0,
    ks: {
      o: st(eyeOpSick),
      r: st(0),
      p: breathePos(225, 174, 2, f),
      a: st([0, 0, 0]),
      s: st([100, 100, 100]),
    },
    shapes: [el(7, 7), fl([1, 1, 1])],
  });

  // ── Sick X-eyes ─────────────────────────────────────────────────────────────
  if (isSick) {
    // Left X
    layers.push(layer(idx++, 'XEyeL1', 170, 178, [
      ph([[-10,-10],[10,10]], [[0,0],[0,0]], [[0,0],[0,0]]),
      sk(c.pupil, 5),
    ], { totalFrames: f, op: sickEyeOpacity }));
    layers.push(layer(idx++, 'XEyeL2', 170, 178, [
      ph([[10,-10],[-10,10]], [[0,0],[0,0]], [[0,0],[0,0]]),
      sk(c.pupil, 5),
    ], { totalFrames: f, op: sickEyeOpacity }));
    // Right X
    layers.push(layer(idx++, 'XEyeR1', 230, 178, [
      ph([[-10,-10],[10,10]], [[0,0],[0,0]], [[0,0],[0,0]]),
      sk(c.pupil, 5),
    ], { totalFrames: f, op: sickEyeOpacity }));
    layers.push(layer(idx++, 'XEyeR2', 230, 178, [
      ph([[10,-10],[-10,10]], [[0,0],[0,0]], [[0,0],[0,0]]),
      sk(c.pupil, 5),
    ], { totalFrames: f, op: sickEyeOpacity }));
  }

  // ── Blush (happy only) ──────────────────────────────────────────────────────
  if (isHappy) {
    layers.push(layer(idx++, 'BlushL', 148, 200, [el(40, 22), fl(c.blush, 65)], { totalFrames: f, pAnim: headPosAnim }));
    layers.push(layer(idx++, 'BlushR', 252, 200, [el(40, 22), fl(c.blush, 65)], { totalFrames: f, pAnim: headPosAnim }));
  }

  // ── Nose ────────────────────────────────────────────────────────────────────
  layers.push(layer(idx++, 'Nose', 200, 213, [el(26, 16), fl(c.nose)], {
    totalFrames: f, pAnim: nosePosAnim,
  }));

  // ── Mouth ───────────────────────────────────────────────────────────────────
  layers.push(layer(idx++, 'Mouth', 200, 233, [mouthPath, sk(c.mouth, 4.5)], {
    totalFrames: f, pAnim: mouthPosAnim,
  }));

  return layers;
}

// ─── main export ─────────────────────────────────────────────────────────────
/**
 * Returns a Lottie animation JSON object.
 * @param {'puppy'|'kitten'|'panda'|'bunny'} petType
 * @param {'idle'|'happy'|'hungry'|'sick'} state
 */
export function getPetAnimation(petType = 'puppy', state = 'idle') {
  const baseColors = PAL[petType] ?? PAL.puppy;

  // Add type-specific extras
  const colors = { ...baseColors };
  if (petType === 'bunny') colors.earInner = [0.980, 0.812, 0.855]; // pink inside
  if (petType === 'kitten') colors.earInner = [0.945, 0.690, 0.745]; // slightly different pink

  // Frame counts per state (30fps)
  const frames = {
    idle:   90,   // 3s slow breathing loop
    happy:  50,   // 1.67s fast bouncy loop
    hungry: 120,  // 4s slow sad loop
    sick:   24,   // 0.8s fast shake loop
  }[state] ?? 90;

  return {
    v: '5.7.4',
    fr: 30,
    ip: 0,
    op: frames,
    w: 400,
    h: 400,
    nm: `${petType}-${state}`,
    ddd: 0,
    assets: [],
    markers: [],
    layers: buildLayers(colors, state, frames),
  };
}

// Pre-compute and cache all 16 combinations at module load
const _cache = {};
export function getCachedPetAnimation(petType, state) {
  const key = `${petType}-${state}`;
  if (!_cache[key]) _cache[key] = getPetAnimation(petType, state);
  return _cache[key];
}
