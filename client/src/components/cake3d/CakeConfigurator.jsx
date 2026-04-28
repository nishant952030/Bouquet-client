import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import { trackEvent } from "../../lib/analytics";
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
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [activeTool, setActiveTool] = useState("candle");
  const [selectedTopping, setSelectedTopping] = useState("cherry");
  const [autoRotate, setAutoRotate] = useState(true);
  const [cakeState, setCakeState] = useState({
    flavor: "chocolate",
    tiers: 1,
    candles: [createCandle(createGeneratedCandlePosition(0))],
    creamSwirls: [],
    toppings: [],
  });

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

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Add the birthday person's name first.");
      return;
    }

    const payload = {
      name: trimmedName,
      flavor: cakeState.flavor,
      tiers: cakeState.tiers,
      age: Math.max(cakeState.candles.length, 1),
      note: note.trim(),
      candles: cakeState.candles,
      creamSwirls: cakeState.creamSwirls,
      toppings: cakeState.toppings,
    };

    track("cake_create_complete", {
      flavor: payload.flavor,
      candles: payload.candles.length,
      mode: "3d",
    });
    trackEvent("cake_create_complete", {
      flavor: payload.flavor,
      candles: payload.candles.length,
      mode: "3d",
    });

    navigate("/payment-cake", { state: payload });
  };

  return (
    <main className="cake3d-page">
      <div className="cake3d-shell">
        <nav className="cake3d-nav" aria-label="Cake builder navigation">
          <Link to="/">
            <img src="/logo-transparent.png" alt="Petals and Words" />
          </Link>
          <Link className="cake3d-home" to="/">Back Home</Link>
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
              onNoteChange={setNote}
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
