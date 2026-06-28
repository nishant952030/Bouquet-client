import { doc, getDoc, getDocFromServer, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { getGiftItemSubtitle, getGiftItemTitle } from "./giftCart";

const BUNDLE_STORAGE_PREFIX = "gift_bundle_";

function createShareId(prefix = "") {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

function saveLocal(key, payload) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn("Local gift save failed:", err.message);
  }
}

async function saveFirestore(collection, id, payload) {
  if (isFirebaseConfigured && db) {
    setDoc(doc(db, collection, id), payload).catch((err) => {
      console.warn(`Firestore ${collection} save failed:`, err.message);
    });
  }
}

function compactPosition(item) {
  return {
    x: Number(item?.x || 0),
    y: Number(item?.y || 0),
    z: Number(item?.z || 0),
  };
}

function compactTopping(item) {
  return {
    type: item?.type || "cherry",
    x: Number(item?.x || 0),
    y: Number(item?.y || 0),
    z: Number(item?.z || 0),
    rotation: Number(item?.rotation || 0),
    colorIndex: Number(item?.colorIndex || 0),
  };
}

function encodeCardData(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function origin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

async function persistBouquet(item, createdAt) {
  const payload = item.payload || {};
  const id = createShareId("bq");
  const sharePayload = {
    stems: Array.isArray(payload.stems) ? payload.stems : [],
    note: typeof payload.note === "string" ? payload.note : "",
    senderName: typeof payload.senderName === "string" ? payload.senderName.trim() : "",
    musicTrack: typeof payload.musicTrack === "string" ? payload.musicTrack : "none",
    plan: "bundle_paid",
    createdAt,
  };

  saveFirestore("bouquets", id, sharePayload);
  saveLocal(`bouquet_share_${id}`, sharePayload);

  return {
    storageId: id,
    type: item.type,
    title: getGiftItemTitle(item),
    subtitle: getGiftItemSubtitle(item),
    url: `${origin()}/view/${id}`,
    musicTrack: sharePayload.musicTrack,
  };
}

async function persistCake(item, createdAt) {
  const payload = item.payload || {};
  const id = createShareId("ck");
  const candles = Array.isArray(payload.candles) ? payload.candles : [];
  const sharePayload = {
    v: 2,
    name: typeof payload.name === "string" ? payload.name : "",
    occasion: typeof payload.occasion === "string" ? payload.occasion : "birthday",
    flavor: typeof payload.flavor === "string" ? payload.flavor : "chocolate",
    tiers: Number(payload.tiers) || 1,
    candleCount: parseInt(payload.age, 10) || Math.max(candles.length, 1),
    note: typeof payload.note === "string" ? payload.note : "",
    candles: candles.map(compactPosition),
    creamSwirls: Array.isArray(payload.creamSwirls) ? payload.creamSwirls.map(compactPosition) : [],
    toppings: Array.isArray(payload.toppings) ? payload.toppings.map(compactTopping) : [],
    musicTrack: typeof payload.musicTrack === "string" ? payload.musicTrack : "none",
    createdAt,
  };

  saveFirestore("cakes", id, sharePayload);
  saveLocal(`cake_share_${id}`, sharePayload);

  return {
    storageId: id,
    type: item.type,
    title: getGiftItemTitle(item),
    subtitle: getGiftItemSubtitle(item),
    url: `${origin()}/cake/${id}`,
    musicTrack: sharePayload.musicTrack,
  };
}

async function persistGreetingCard(item, createdAt) {
  const payload = item.payload || {};
  const id = createShareId("gc");
  const cardData = {
    to: typeof payload.to === "string" ? payload.to.trim() : "",
    title: typeof payload.title === "string" ? payload.title.trim() : "",
    msg: typeof payload.msg === "string" ? payload.msg : "",
    from: typeof payload.from === "string" ? payload.from.trim() : "",
    paper: typeof payload.paper === "string" ? payload.paper : "blush",
    decos: Array.isArray(payload.decos) ? payload.decos : [],
    musicTrack: typeof payload.musicTrack === "string" ? payload.musicTrack : "none",
  };
  const sharePayload = {
    ...cardData,
    type: "greeting_card",
    plan: "bundle_paid",
    createdAt,
  };

  saveFirestore("cards", id, sharePayload);
  saveLocal(`card_share_${id}`, sharePayload);

  return {
    storageId: id,
    type: item.type,
    title: getGiftItemTitle(item),
    subtitle: getGiftItemSubtitle(item),
    url: `${origin()}/greeting-card?card=${encodeURIComponent(encodeCardData(cardData))}`,
    musicTrack: cardData.musicTrack,
  };
}

async function persistHugCard(item) {
  const payload = item.payload || {};
  let url = `${origin()}/hug-card`;
  
  // If the hug card was customized, encode the payload into the URL
  if (Object.keys(payload).length > 0) {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    url = `${url}?data=${encodeURIComponent(encoded)}`;
  }

  return {
    storageId: "hug-card",
    type: item.type,
    title: getGiftItemTitle(item),
    subtitle: getGiftItemSubtitle(item),
    url,
    musicTrack: payload.musicTrack || "none",
  };
}

async function persistPlushie(item, createdAt) {
  const payload = item.payload || {};
  const id = createShareId("pl");
  const plushieData = {
    plushieType: typeof payload.plushieType === "string" ? payload.plushieType : "bear",
    furColor: typeof (payload.furColor || payload.color) === "string" ? (payload.furColor || payload.color) : "brown",
    accessory: typeof payload.accessory === "string" ? payload.accessory : "none",
    boxStyle: typeof payload.boxStyle === "string" ? payload.boxStyle : "pink",
    msg: typeof payload.msg === "string" ? payload.msg : "",
    to: typeof payload.to === "string" ? payload.to.trim() : "",
    from: typeof payload.from === "string" ? payload.from.trim() : "",
    musicTrack: typeof payload.musicTrack === "string" ? payload.musicTrack : "none",
  };
  const sharePayload = {
    ...plushieData,
    type: "plushie",
    plan: "bundle_paid",
    createdAt,
  };

  saveFirestore("plushies", id, sharePayload);
  saveLocal(`plushie_share_${id}`, sharePayload);

  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(plushieData))));
  return {
    storageId: id,
    type: item.type,
    title: getGiftItemTitle(item),
    subtitle: getGiftItemSubtitle(item),
    url: `${origin()}/plushie/${id}?data=${encodeURIComponent(encoded)}`,
    musicTrack: plushieData.musicTrack,
  };
}

async function persistGiftItem(item, createdAt) {
  switch (item.type) {
    case "bouquet":
      return persistBouquet(item, createdAt);
    case "cake":
      return persistCake(item, createdAt);
    case "greeting_card":
    case "mothers_day_card": // Legacy
      return persistGreetingCard(item, createdAt);
    case "hug_card":
      return persistHugCard(item, createdAt);
    case "plushie":
      return persistPlushie(item, createdAt);
    default:
      return null;
  }
}

export async function createGiftBundle(items, payment = {}) {
  const validItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const createdAt = new Date().toISOString();
  const shareItems = [];

  for (const item of validItems) {
    const shareItem = await persistGiftItem(item, createdAt);
    if (shareItem) {
      shareItems.push({
        ...shareItem,
        cartItemId: item.cartItemId,
      });
    }
  }

  if (!shareItems.length) return null;

  const id = createShareId("gb");
  const payload = {
    v: 1,
    items: shareItems,
    payment,
    createdAt,
  };

  saveFirestore("giftBundles", id, payload);
  saveLocal(`${BUNDLE_STORAGE_PREFIX}${id}`, payload);

  return {
    id,
    payload,
    url: `${origin()}/gift/${id}`,
  };
}

export async function loadGiftBundle(id) {
  if (!id) return null;

  try {
    if (isFirebaseConfigured && db) {
      let snapshot;
      try {
        snapshot = await getDocFromServer(doc(db, "giftBundles", id));
      } catch (serverError) {
        console.warn("Server bundle fetch failed, using cached Firestore read.", serverError);
        snapshot = await getDoc(doc(db, "giftBundles", id));
      }
      if (snapshot.exists()) return snapshot.data();
    }
  } catch (err) {
    console.warn("Bundle Firestore read failed:", err.message);
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${BUNDLE_STORAGE_PREFIX}${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
