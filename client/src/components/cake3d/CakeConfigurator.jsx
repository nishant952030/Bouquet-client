import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { Link, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import { trackEvent } from "../../lib/analytics";
import { addGiftCartItem } from "../../lib/giftCart";
import { applySeo, seoKeywords, SITE_URL } from "../../lib/seo";
import CakeControls from "./CakeControls.jsx";
import CakeScene from "./CakeScene.jsx";
import {
  MAX_CANDLES,
  MAX_CREAM_SWIRLS,
  MAX_TIERS,
  MAX_TOPPINGS,
  MIN_TIERS,
  createGeneratedCandlePosition,
  createGeneratedCreamPosition,
  createGeneratedToppingPosition,
} from "./cakeConfig";
import "./cake3d.css";

function createCandle(position) {
  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    x: Number(position.x.toFixed(3)),
    y: Number(position.y.toFixed(3)),
    z: Number(position.z.toFixed(3)),
  };
}

function createCreamSwirl(position) {
  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    x: Number(position.x.toFixed(3)),
    y: Number(position.y.toFixed(3)),
    z: Number(position.z.toFixed(3)),
  };
}

function createTopping(position, type, index = 0) {
  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    type,
    x: Number(position.x.toFixed(3)),
    y: Number(position.y.toFixed(3)),
    z: Number(position.z.toFixed(3)),
    rotation: Number(((index * 0.71) % Math.PI).toFixed(3)),
    colorIndex: index,
  };
}

export default function CakeConfigurator() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [occasion, setOccasion] = useState("birthday");
  const [musicTrack, setMusicTrack] = useState("none");
  const [error, setError] = useState("");
  const [activeTool, setActiveTool] = useState("candle");
  const [selectedTopping, setSelectedTopping] = useState("cherry");
  const [autoRotate, setAutoRotate] = useState(true);
  const [added, setAdded] = useState(false);
  const [cakeState, setCakeState] = useState({
    flavor: "chocolate",
    tiers: 1,
    candles: [createCandle(createGeneratedCandlePosition(0))],
    creamSwirls: [],
    toppings: [],
  });

  useEffect(() => {
    applySeo({
      title: "Free Virtual Birthday Cake Maker | Create a 3D Cake Online",
      description:
        "Create a free interactive 3D birthday cake online. Choose flavors, add candles and toppings, write a message, and send a virtual cake link instantly.",
      keywords: seoKeywords.cake,
      path: "/create-cake",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Petals and Words Virtual Birthday Cake Maker",
        url: `${SITE_URL}/create-cake`,
        description:
          "A free online 3D cake maker for creating and sharing interactive birthday cakes with candles, toppings, and personal messages.",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    });
  }, []);

  const addCandleAtPosition = useCallback((position) => {
    setCakeState((current) => {
      if (current.candles.length >= MAX_CANDLES) return current;
      return {
        ...current,
        candles: [...current.candles, createCandle(position)],
      };
    });
  }, []);

  const addCreamAtPosition = useCallback((position) => {
    setCakeState((current) => {
      if (current.creamSwirls.length >= MAX_CREAM_SWIRLS) return current;
      return {
        ...current,
        creamSwirls: [...current.creamSwirls, createCreamSwirl(position)],
      };
    });
  }, []);

  const addToppingAtPosition = useCallback((position, type) => {
    setCakeState((current) => {
      if (current.toppings.length >= MAX_TOPPINGS) return current;
      return {
        ...current,
        toppings: [...current.toppings, createTopping(position, type, current.toppings.length)],
      };
    });
  }, []);

  const addGeneratedCandle = () => {
    setCakeState((current) => {
      if (current.candles.length >= MAX_CANDLES) return current;
      const position = createGeneratedCandlePosition(current.candles.length, current.tiers);
      return {
        ...current,
        candles: [...current.candles, createCandle(position)],
      };
    });
  };

  const addGeneratedCream = () => {
    setCakeState((current) => {
      if (current.creamSwirls.length >= MAX_CREAM_SWIRLS) return current;
      const position = createGeneratedCreamPosition(current.creamSwirls.length, current.tiers);
      return {
        ...current,
        creamSwirls: [...current.creamSwirls, createCreamSwirl(position)],
      };
    });
  };

  const addGeneratedTopping = (type = selectedTopping) => {
    setCakeState((current) => {
      if (current.toppings.length >= MAX_TOPPINGS) return current;
      const position = createGeneratedToppingPosition(current.toppings.length, current.tiers);
      return {
        ...current,
        toppings: [...current.toppings, createTopping(position, type, current.toppings.length)],
      };
    });
  };

  const changeFlavor = (flavor) => {
    setCakeState((current) => ({ ...current, flavor }));
  };

  const changeTiers = (nextTiers) => {
    setCakeState((current) => ({
      ...current,
      tiers: Math.min(Math.max(nextTiers, MIN_TIERS), MAX_TIERS),
      candles: [],
      creamSwirls: [],
      toppings: [],
    }));
  };

  const clearCandles = () => {
    setCakeState((current) => ({ ...current, candles: [] }));
  };

  const clearCream = () => {
    setCakeState((current) => ({ ...current, creamSwirls: [] }));
  };

  const clearToppings = () => {
    setCakeState((current) => ({ ...current, toppings: [] }));
  };

  const buildCakePayload = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(t("cakeControls.errorNameFirst", "Add the recipient's name first."));
      return null;
    }

    return {
      name: trimmedName,
      occasion,
      flavor: cakeState.flavor,
      tiers: cakeState.tiers,
      age: Math.max(cakeState.candles.length, 1),
      note: note.trim(),
      candles: cakeState.candles,
      creamSwirls: cakeState.creamSwirls,
      toppings: cakeState.toppings,
      musicTrack,
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = buildCakePayload();
    if (!payload) return;

    track("cake_create_complete", {
      flavor: payload.flavor,
      candles: payload.candles.length,
      occasion,
      mode: "3d",
    });
    trackEvent("cake_create_complete", {
      flavor: payload.flavor,
      candles: payload.candles.length,
      occasion,
      mode: "3d",
    });

    navigate("/payment-cake", { state: payload });
  };

  const addCakeToCart = () => {
    const payload = buildCakePayload();
    if (!payload) return;

    addGiftCartItem("cake", payload);
    track("gift_cart_add", {
      type: "cake",
      flavor: payload.flavor,
      candles: payload.candles.length,
      occasion,
    });
    trackEvent("gift_cart_add", {
      type: "cake",
      flavor: payload.flavor,
      candles: payload.candles.length,
      occasion,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="cake3d-page">
      <div className="cake3d-shell">
        <nav className="cake3d-nav" aria-label="Cake builder navigation">
          <Link to="/">
            <img src="/logo-transparent.png" alt="Petals and Words" />
          </Link>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginLeft: "auto" }}>
            <LanguageSwitcher />
            <Link className="cake3d-home" to="/">{t("common.backHome", "Back Home")}</Link>
          </div>
        </nav>

        <div className="cake3d-layout">
          <section className="cake3d-stage" aria-label="Interactive cake preview">
            <div className="cake3d-canvas-card">
              <CakeScene
                activeTool={activeTool}
                autoRotate={autoRotate}
                candles={cakeState.candles}
                creamSwirls={cakeState.creamSwirls}
                flavor={cakeState.flavor}
                selectedTopping={selectedTopping}
                tiers={cakeState.tiers}
                toppings={cakeState.toppings}
                onPlaceCandle={addCandleAtPosition}
                onPlaceCream={addCreamAtPosition}
                onPlaceTopping={addToppingAtPosition}
              />
            </div>
          </section>

          <aside className="cake3d-panel">
            <CakeControls
              activeTool={activeTool}
              autoRotate={autoRotate}
              cakeState={cakeState}
              error={error}
              name={name}
              note={note}
              occasion={occasion}
              selectedTopping={selectedTopping}
              onActiveToolChange={setActiveTool}
              onAddCandle={addGeneratedCandle}
              onAddCream={addGeneratedCream}
              onAddTopping={addGeneratedTopping}
              onClearCandles={clearCandles}
              onClearCream={clearCream}
              onClearToppings={clearToppings}
              onFlavorChange={changeFlavor}
              onTierChange={changeTiers}
              onNameChange={(value) => {
                setName(value);
                setError("");
              }}
              musicTrack={musicTrack}
              onMusicTrackChange={setMusicTrack}
              onNoteChange={setNote}
              onOccasionChange={setOccasion}
              onAddToCart={addCakeToCart}
              addedToCart={added}
              onSelectedToppingChange={(type) => {
                setSelectedTopping(type);
                setActiveTool("topping");
              }}
              onSubmit={handleSubmit}
              onToggleRotation={() => setAutoRotate((current) => !current)}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

