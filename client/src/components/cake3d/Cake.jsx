import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Candle from "./Candle.jsx";
import CreamSwirl from "./CreamSwirl.jsx";
import Topping from "./Topping.jsx";
import {
  CAKE_HEIGHT,
  CAKE_RADIUS,
  FLAVORS,
  clampCandlePosition,
  getCakeTopRadius,
  getCakeTopY,
} from "./cakeConfig";

const sprinkleColors = ["#ffffff", "#ffe066", "#ff6b9a", "#4dd4f0", "#95de64", "#b197fc"];

function Sprinkles({ radius, topY }) {
  const sprinkles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => {
        const angle = index * 2.08;
        const sprinkleRadius = 0.16 + (((index * 41) % 96) / 100) * (radius / CAKE_RADIUS);
        return {
          color: sprinkleColors[index % sprinkleColors.length],
          position: [Math.cos(angle) * sprinkleRadius, topY + 0.055, Math.sin(angle) * sprinkleRadius],
          rotation: [Math.PI / 2, 0, angle + index * 0.43],
        };
      }),
    [radius, topY],
  );

  return sprinkles.map((sprinkle, index) => (
    <mesh key={index} position={sprinkle.position} rotation={sprinkle.rotation} castShadow>
      <boxGeometry args={[0.16, 0.022, 0.035]} />
      <meshStandardMaterial color={sprinkle.color} roughness={0.44} />
    </mesh>
  ));
}

export default function Cake({
  flavor,
  tiers,
  candles,
  creamSwirls,
  toppings,
  activeTool,
  selectedTopping,
  autoRotate,
  readOnly = false,
  extinguishedCandleIds = [],
  onPlaceCandle,
  onPlaceCream,
  onPlaceTopping,
  onCandleBlow,
}) {
  const groupRef = useRef(null);
  const flavorTheme = FLAVORS[flavor] || FLAVORS.chocolate;
  const topY = getCakeTopY(tiers);
  const topRadius = getCakeTopRadius(tiers);
  const tierItems = useMemo(
    () =>
      Array.from({ length: tiers }, (_, index) => ({
        y: CAKE_HEIGHT / 2 + index * CAKE_HEIGHT,
        radius: CAKE_RADIUS - index * 0.2,
      })),
    [tiers],
  );

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.22;
    }
  });

  const handleCakeClick = (event) => {
    event.stopPropagation();
    if (readOnly) return;
    if (!groupRef.current) return;

    const localPoint = groupRef.current.worldToLocal(event.point.clone());
    const position = clampCandlePosition(localPoint, tiers);

    if (activeTool === "cream") {
      onPlaceCream?.({ ...position, y: topY + 0.08 });
      return;
    }

    if (activeTool === "topping") {
      onPlaceTopping?.({ ...position, y: topY + 0.12 }, selectedTopping);
      return;
    }

    onPlaceCandle?.(position);
  };

  const showPointer = (event) => {
    event.stopPropagation();
    if (readOnly) return;
    document.body.style.cursor = "pointer";
  };

  const hidePointer = () => {
    document.body.style.cursor = "";
  };

  return (
    <group ref={groupRef} position={[0, -0.16, 0]}>
      {tierItems.map((tier, index) => (
        <mesh key={index} position={[0, tier.y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[tier.radius, tier.radius, CAKE_HEIGHT, 96]} />
          <meshStandardMaterial color={flavorTheme.cake} roughness={0.58} metalness={0.02} />
        </mesh>
      ))}

      <mesh
        position={[0, topY + 0.035, 0]}
        castShadow
        receiveShadow
        onPointerDown={handleCakeClick}
        onPointerOver={showPointer}
        onPointerOut={hidePointer}
      >
        <cylinderGeometry args={[topRadius + 0.03, topRadius + 0.03, 0.08, 96]} />
        <meshStandardMaterial color={flavorTheme.frosting} roughness={0.5} metalness={0.01} />
      </mesh>

      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[CAKE_RADIUS + 0.18, CAKE_RADIUS + 0.22, 0.1, 96]} />
        <meshStandardMaterial color="#f5efe7" roughness={0.38} metalness={0.08} />
      </mesh>

      <Sprinkles radius={topRadius} topY={topY} />

      <mesh
        position={[0, topY + 0.082, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handleCakeClick}
        onPointerOver={showPointer}
        onPointerOut={hidePointer}
        visible={false}
      >
        <circleGeometry args={[topRadius - 0.1, 96]} />
        <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0} />
      </mesh>

      {candles.map((candle) => (
        <Candle
          key={candle.id}
          position={candle}
          accent={flavorTheme.accent}
          extinguished={extinguishedCandleIds.includes(candle.id)}
          onBlow={onCandleBlow ? () => onCandleBlow(candle.id) : undefined}
        />
      ))}

      {creamSwirls.map((cream) => (
        <CreamSwirl key={cream.id} position={cream} />
      ))}

      {toppings.map((topping) => (
        <Topping key={topping.id} topping={topping} />
      ))}
    </group>
  );
}
