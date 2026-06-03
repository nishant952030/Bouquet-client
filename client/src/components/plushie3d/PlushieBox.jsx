import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BOX_STYLES } from "./plushieConfig";

const getInteriorColor = (style) => {
  switch (style) {
    case "romantic": return "#fff1f2"; // soft pink cream
    case "classic": return "#fef3c7";  // warm gold cream
    case "royal": return "#f0f7ff";    // ice silver blue
    case "festive": return "#f0fdf4";  // mint cream
    case "birthday": return "#fffbeb"; // warm ivory
    default: return "#fffdf8";
  }
};

export default function PlushieBox({ children, boxStyle = "romantic", isOpen = false }) {
  const baseRef = useRef();
  const lidRef = useRef();
  const plushieRef = useRef();

  // Find style configs
  const styleConfig = BOX_STYLES.find((b) => b.id === boxStyle) || BOX_STYLES[0];
  const baseColor = styleConfig.baseBg;
  const ribbonColor = styleConfig.ribbonBg;
  const interiorColor = getInteriorColor(boxStyle);

  // Lerp progress values in state/refs for smooth animation
  const animationProgress = useRef(0);

  useFrame((state, delta) => {
    // Target is 1 if open, 0 if closed
    const target = isOpen ? 1 : 0;
    // Smooth lerp speed
    animationProgress.current = THREE.MathUtils.lerp(
      animationProgress.current,
      target,
      delta * 4.2
    );

    const progress = animationProgress.current;

    // 1. Animate Lid (flies up, back, and rotates)
    if (lidRef.current) {
      lidRef.current.position.y = 0.175 + progress * 1.6;
      lidRef.current.position.z = -progress * 1.7;
      lidRef.current.rotation.x = -progress * (Math.PI / 2.5);
    }

    // 2. Animate Plushie (rises out of the box and floats)
    if (plushieRef.current) {
      const floatOffset = isOpen
        ? Math.sin(state.clock.getElapsedTime() * 1.8) * 0.08
        : 0;
      // Start sitting on cushion when closed, pop up high when open
      plushieRef.current.position.y = -0.48 + progress * 1.54 + floatOffset;
      // Gentle spin when open
      plushieRef.current.rotation.y = progress * (Math.PI * 0.08) + Math.sin(state.clock.getElapsedTime() * 0.8) * 0.05;
      // Smooth scale transition
      const scaleVal = 0.55 + progress * 0.45;
      plushieRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* ─── PLUSHIE CONTAINER (RISE ANIMS) ─── */}
      <group ref={plushieRef} position={[0, -0.48, 0]}>
        {children}
      </group>

      {/* ─── GIFT BOX BASE (HOLLOW DESIGN) ─── */}
      <group ref={baseRef}>
        {/* Exterior Walls (0.08 thickness) */}
        {/* Left Wall */}
        <mesh castShadow receiveShadow position={[-0.91, -0.5, 0]}>
          <boxGeometry args={[0.08, 1.35, 1.9]} />
          <meshStandardMaterial color={baseColor} roughness={0.7} />
        </mesh>
        {/* Right Wall */}
        <mesh castShadow receiveShadow position={[0.91, -0.5, 0]}>
          <boxGeometry args={[0.08, 1.35, 1.9]} />
          <meshStandardMaterial color={baseColor} roughness={0.7} />
        </mesh>
        {/* Front Wall */}
        <mesh castShadow receiveShadow position={[0, -0.5, 0.91]}>
          <boxGeometry args={[1.74, 1.35, 0.08]} />
          <meshStandardMaterial color={baseColor} roughness={0.7} />
        </mesh>
        {/* Back Wall */}
        <mesh castShadow receiveShadow position={[0, -0.5, -0.91]}>
          <boxGeometry args={[1.74, 1.35, 0.08]} />
          <meshStandardMaterial color={baseColor} roughness={0.7} />
        </mesh>
        {/* Bottom Base */}
        <mesh castShadow receiveShadow position={[0, -1.135, 0]}>
          <boxGeometry args={[1.9, 0.08, 1.9]} />
          <meshStandardMaterial color={baseColor} roughness={0.7} />
        </mesh>

        {/* Interior Lining (Satin Contrast Color) */}
        {/* Left Interior Lining */}
        <mesh position={[-0.869, -0.5, 0]}>
          <boxGeometry args={[0.002, 1.33, 1.88]} />
          <meshStandardMaterial color={interiorColor} roughness={0.8} />
        </mesh>
        {/* Right Interior Lining */}
        <mesh position={[0.869, -0.5, 0]}>
          <boxGeometry args={[0.002, 1.33, 1.88]} />
          <meshStandardMaterial color={interiorColor} roughness={0.8} />
        </mesh>
        {/* Front Interior Lining */}
        <mesh position={[0, -0.5, 0.869]}>
          <boxGeometry args={[1.72, 1.33, 0.002]} />
          <meshStandardMaterial color={interiorColor} roughness={0.8} />
        </mesh>
        {/* Back Interior Lining */}
        <mesh position={[0, -0.5, -0.869]}>
          <boxGeometry args={[1.72, 1.33, 0.002]} />
          <meshStandardMaterial color={interiorColor} roughness={0.8} />
        </mesh>
        {/* Floor Lining */}
        <mesh position={[0, -1.09, 0]}>
          <boxGeometry args={[1.74, 0.002, 1.74]} />
          <meshStandardMaterial color={interiorColor} roughness={0.8} />
        </mesh>

        {/* Soft Bedding Cushion Pillow */}
        <mesh position={[0, -0.98, 0]} scale={[1.72, 0.22, 1.72]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#fffdf6" roughness={0.95} />
        </mesh>

        {/* Shiny Gold Rim Trim */}
        <mesh position={[-0.91, 0.18, 0]}>
          <boxGeometry args={[0.082, 0.02, 1.92]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.91, 0.18, 0]}>
          <boxGeometry args={[0.082, 0.02, 1.92]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.18, 0.91]}>
          <boxGeometry args={[1.74, 0.02, 0.082]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.18, -0.91]}>
          <boxGeometry args={[1.74, 0.02, 0.082]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Wrapped Ribbons around exterior walls */}
        {/* Left Ribbon */}
        <mesh position={[-0.952, -0.5, 0]}>
          <boxGeometry args={[0.002, 1.35, 0.18]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        {/* Right Ribbon */}
        <mesh position={[0.952, -0.5, 0]}>
          <boxGeometry args={[0.002, 1.35, 0.18]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        {/* Front Ribbon */}
        <mesh position={[0, -0.5, 0.952]}>
          <boxGeometry args={[0.18, 1.35, 0.002]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        {/* Back Ribbon */}
        <mesh position={[0, -0.5, -0.952]}>
          <boxGeometry args={[0.18, 1.35, 0.002]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        {/* Bottom Ribbons */}
        <mesh position={[0, -1.18, 0]}>
          <boxGeometry args={[0.18, 0.01, 1.92]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        <mesh position={[0, -1.18, 0]}>
          <boxGeometry args={[1.92, 0.01, 0.18]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
      </group>

      {/* ─── GIFT BOX LID ─── */}
      <group ref={lidRef} position={[0, 0.175, 0]}>
        {/* Lid Top */}
        <mesh castShadow position={[0, 0.03, 0]}>
          <boxGeometry args={[2.0, 0.06, 2.0]} />
          <meshStandardMaterial color={baseColor} roughness={0.65} />
        </mesh>

        {/* Lid Rims (overlapping base) */}
        {/* Left Rim */}
        <mesh position={[-0.98, -0.01, 0]}>
          <boxGeometry args={[0.04, 0.08, 2.0]} />
          <meshStandardMaterial color={baseColor} roughness={0.65} />
        </mesh>
        {/* Right Rim */}
        <mesh position={[0.98, -0.01, 0]}>
          <boxGeometry args={[0.04, 0.08, 2.0]} />
          <meshStandardMaterial color={baseColor} roughness={0.65} />
        </mesh>
        {/* Front Rim */}
        <mesh position={[0, -0.01, 0.98]}>
          <boxGeometry args={[1.96, 0.08, 0.04]} />
          <meshStandardMaterial color={baseColor} roughness={0.65} />
        </mesh>
        {/* Back Rim */}
        <mesh position={[0, -0.01, -0.98]}>
          <boxGeometry args={[1.96, 0.08, 0.04]} />
          <meshStandardMaterial color={baseColor} roughness={0.65} />
        </mesh>
        
        {/* Lid Ribbon Cross on Top */}
        <mesh position={[0, 0.062, 0]}>
          <boxGeometry args={[0.2, 0.005, 2.02]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.062, 0]}>
          <boxGeometry args={[2.02, 0.005, 0.2]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>

        {/* Lid Ribbon running down the Rims */}
        <mesh position={[0, -0.01, 1.002]}>
          <boxGeometry args={[0.2, 0.09, 0.004]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.01, -1.002]}>
          <boxGeometry args={[0.2, 0.09, 0.004]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        <mesh position={[-1.002, -0.01, 0]}>
          <boxGeometry args={[0.004, 0.09, 0.2]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>
        <mesh position={[1.002, -0.01, 0]}>
          <boxGeometry args={[0.004, 0.09, 0.2]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
        </mesh>

        {/* Ribbon Bow on Top */}
        <group position={[0, 0.065, 0]} rotation={[0, Math.PI / 4, 0]}>
          {/* Bow Loop 1 (Torus) */}
          <mesh position={[-0.15, 0.12, 0]} rotation={[0, 0, 0.4]} scale={[0.22, 0.08, 0.12]}>
            <torusGeometry args={[0.7, 0.2, 8, 24]} />
            <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
          </mesh>
          {/* Bow Loop 2 (Torus) */}
          <mesh position={[0.15, 0.12, 0]} rotation={[0, 0, -0.4]} scale={[0.22, 0.08, 0.12]}>
            <torusGeometry args={[0.7, 0.2, 8, 24]} />
            <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
          </mesh>
          {/* Bow Knot */}
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
          </mesh>

          {/* Draping Ribbon Tails */}
          <mesh position={[-0.1, 0.04, 0.12]} rotation={[0.4, 0.2, -0.4]} scale={[0.08, 0.015, 0.4]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
          </mesh>
          <mesh position={[0.1, 0.04, 0.12]} rotation={[0.4, -0.2, 0.4]} scale={[0.08, 0.015, 0.4]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={ribbonColor} roughness={0.15} metalness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
