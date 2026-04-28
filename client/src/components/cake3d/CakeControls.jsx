import {
  FLAVORS,
  MAX_CANDLES,
  MAX_CREAM_SWIRLS,
  MAX_TIERS,
  MAX_TOPPINGS,
  MIN_TIERS,
  TOPPING_TYPES,
} from "./cakeConfig";

export default function CakeControls({
  cakeState,
  activeTool,
  selectedTopping,
  autoRotate,
  name,
  note,
  error,
  onFlavorChange,
  onActiveToolChange,
  onToggleRotation,
  onAddCandle,
  onAddCream,
  onAddTopping,
  onClearCandles,
  onClearCream,
  onClearToppings,
  onTierChange,
  onNameChange,
  onNoteChange,
  onSelectedToppingChange,
  onSubmit,
}) {
  const candleCount = cakeState.candles.length;
  const creamCount = cakeState.creamSwirls.length;
  const toppingCount = cakeState.toppings.length;

  return (
    <form className="cake3d-controls" onSubmit={onSubmit}>
      <div className="cake3d-field">
        <label htmlFor="cake3d-name">Recipient name</label>
        <input
          id="cake3d-name"
          maxLength={36}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="e.g. Aanya"
          value={name}
        />
      </div>

      <div className="cake3d-field">
        <span className="cake3d-label">Flavor</span>
        <div className="cake3d-flavor-grid">
          {Object.entries(FLAVORS).map(([id, flavor]) => (
            <button
              className={cakeState.flavor === id ? "active" : ""}
              key={id}
              onClick={() => onFlavorChange(id)}
              type="button"
            >
              <span style={{ background: flavor.cake }} />
              {flavor.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">Cake storeys</span>
          <strong>{cakeState.tiers}/{MAX_TIERS}</strong>
        </div>
        <div className="cake3d-button-row">
          <button
            onClick={() => onTierChange(cakeState.tiers + 1)}
            type="button"
            disabled={cakeState.tiers >= MAX_TIERS}
          >
            Add storey
          </button>
          <button
            onClick={() => onTierChange(cakeState.tiers - 1)}
            type="button"
            disabled={cakeState.tiers <= MIN_TIERS}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">Scene</span>
          <strong>{autoRotate ? "Rotating" : "Stopped"}</strong>
        </div>
        <button className="cake3d-wide-button" onClick={onToggleRotation} type="button">
          {autoRotate ? "Stop rotation" : "Start rotation"}
        </button>
      </div>

      <div className="cake3d-field">
        <span className="cake3d-label">Click tool</span>
        <div className="cake3d-tool-row">
          <button
            className={activeTool === "candle" ? "active" : ""}
            onClick={() => onActiveToolChange("candle")}
            type="button"
          >
            Candle
          </button>
          <button
            className={activeTool === "cream" ? "active" : ""}
            onClick={() => onActiveToolChange("cream")}
            type="button"
          >
            Cream
          </button>
          <button
            className={activeTool === "topping" ? "active" : ""}
            onClick={() => onActiveToolChange("topping")}
            type="button"
          >
            Topping
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">Candles</span>
          <strong>{candleCount}/{MAX_CANDLES}</strong>
        </div>
        <div className="cake3d-button-row">
          <button onClick={onAddCandle} type="button" disabled={candleCount >= MAX_CANDLES}>
            Add candle
          </button>
          <button onClick={onClearCandles} type="button" disabled={candleCount === 0}>
            Clear
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">Cream swirls</span>
          <strong>{creamCount}/{MAX_CREAM_SWIRLS}</strong>
        </div>
        <div className="cake3d-button-row">
          <button onClick={onAddCream} type="button" disabled={creamCount >= MAX_CREAM_SWIRLS}>
            Add cream
          </button>
          <button onClick={onClearCream} type="button" disabled={creamCount === 0}>
            Clear
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">Toppings</span>
          <strong>{toppingCount}/{MAX_TOPPINGS}</strong>
        </div>
        <div className="cake3d-topping-grid">
          {Object.entries(TOPPING_TYPES).map(([id, topping]) => (
            <button
              className={selectedTopping === id ? "active" : ""}
              key={id}
              onClick={() => onSelectedToppingChange(id)}
              type="button"
            >
              <span style={{ background: topping.color }} />
              {topping.label}
            </button>
          ))}
        </div>
        <div className="cake3d-button-row">
          <button
            onClick={() => onAddTopping(selectedTopping)}
            type="button"
            disabled={toppingCount >= MAX_TOPPINGS}
          >
            Add topping
          </button>
          <button onClick={onClearToppings} type="button" disabled={toppingCount === 0}>
            Clear
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <label htmlFor="cake3d-note">Birthday note</label>
        <textarea
          id="cake3d-note"
          maxLength={240}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Write a wish they will see after the candles are out."
          value={note}
        />
      </div>

      {error && <div className="cake3d-error">{error}</div>}

      <button className="cake3d-submit" type="submit">
        Bake cake
      </button>
    </form>
  );
}
