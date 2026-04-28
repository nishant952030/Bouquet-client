import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CANDLE_HEIGHT } from "./cakeConfig";

export default function Candle({ position, accent = "#d94c76", extinguished = false, onBlow }) {
  const flameRef = useRef(null);
  const innerFlameRef = useRef(null);
  const lightRef = useRef(null);
  const smokeOneRef = useRef(null);
  const smokeTwoRef = useRef(null);
  const smokeThreeRef = useRef(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(time * 18 + position.x * 7) * 0.12 + Math.sin(time * 31 + position.z * 5) * 0.05;

    if (extinguished) {
      if (lightRef.current) lightRef.current.intensity = 0;

      [smokeOneRef, smokeTwoRef, smokeThreeRef].forEach((ref, index) => {
        if (!ref.current) return;
        const drift = (Math.sin(time * (1.8 + index) + index) + 1) * 0.025;
        ref.current.position.y = CANDLE_HEIGHT + 0.13 + ((time * 0.18 + index * 0.08) % 0.32);
        ref.current.position.x = (index - 1) * 0.045 + drift;
        ref.current.scale.setScalar(0.72 + ((time * 0.45 + index * 0.22) % 0.55));
        ref.current.material.opacity = Math.max(0.08, 0.32 - ((time * 0.12 + index * 0.05) % 0.26));
      });
      return;
    }

    if (flameRef.current) {
      flameRef.current.scale.set(0.7 * flicker, 1.12 + (flicker - 1) * 0.8, 0.7 * flicker);
      flameRef.current.rotation.z = Math.sin(time * 16 + position.x) * 0.12;
    }

    if (innerFlameRef.current) {
      innerFlameRef.current.scale.set(0.46 * flicker, 0.68 + (flicker - 1) * 0.5, 0.46 * flicker);
    }

    if (lightRef.current) {
      lightRef.current.intensity = 0.7 + (flicker - 1) * 1.2;
    }
  });

  const handlePointerDown = (event) => {
    if (!onBlow || extinguished) return;
    event.stopPropagation();
    onBlow();
  };

  const handlePointerOver = (event) => {
    if (!onBlow || extinguished) return;
    event.stopPropagation();
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    if (!onBlow) return;
    document.body.style.cursor = "";
  };

  return (
    <group
      position={[position.x, position.y, position.z]}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh position={[0, CANDLE_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, CANDLE_HEIGHT, 24]} />
        <meshStandardMaterial color="#fff7ee" roughness={0.48} />
      </mesh>

      <mesh position={[0, CANDLE_HEIGHT / 2, 0.006]} rotation={[0, 0, -0.45]} castShadow>
        <boxGeometry args={[0.018, CANDLE_HEIGHT * 0.94, 0.012]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>

      <mesh position={[0, CANDLE_HEIGHT + 0.035, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.08, 10]} />
        <meshStandardMaterial color="#2f231f" roughness={0.75} />
      </mesh>

      {!extinguished && (
        <group position={[0, CANDLE_HEIGHT + 0.16, 0]}>
          <mesh ref={flameRef} scale={[0.56, 1.35, 0.56]}>
            <sphereGeometry args={[0.095, 24, 24]} />
            <meshStandardMaterial
              color="#ff8f1f"
              emissive="#ff6a00"
              emissiveIntensity={2.1}
              roughness={0.25}
              transparent
              opacity={0.92}
            />
          </mesh>
          <mesh ref={innerFlameRef} position={[0, 0.01, 0]} scale={[0.34, 0.86, 0.34]}>
            <sphereGeometry args={[0.08, 20, 20]} />
            <meshStandardMaterial
              color="#fff1a8"
              emissive="#ffd95a"
              emissiveIntensity={2.9}
              roughness={0.18}
              transparent
              opacity={0.95}
            />
          </mesh>
        </group>
      )}

      {extinguished && (
        <>
          <mesh ref={smokeOneRef} position={[-0.04, CANDLE_HEIGHT + 0.15, 0]} scale={[0.8, 0.8, 0.8]}>
            <sphereGeometry args={[0.055, 16, 12]} />
            <meshStandardMaterial color="#d9d9d9" transparent opacity={0.26} roughness={0.9} depthWrite={false} />
          </mesh>
          <mesh ref={smokeTwoRef} position={[0.02, CANDLE_HEIGHT + 0.23, 0.015]} scale={[0.72, 0.72, 0.72]}>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshStandardMaterial color="#eeeeee" transparent opacity={0.22} roughness={0.9} depthWrite={false} />
          </mesh>
          <mesh ref={smokeThreeRef} position={[0.055, CANDLE_HEIGHT + 0.31, -0.01]} scale={[0.62, 0.62, 0.62]}>
            <sphereGeometry args={[0.046, 16, 12]} />
            <meshStandardMaterial color="#cfcfcf" transparent opacity={0.18} roughness={0.9} depthWrite={false} />
          </mesh>
        </>
      )}

      {!extinguished && (
        <pointLight ref={lightRef} position={[0, CANDLE_HEIGHT + 0.17, 0]} color="#ffb347" intensity={0.7} distance={1.55} />
      )}
    </group>
  );
}
