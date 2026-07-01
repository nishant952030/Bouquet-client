export default function Plushie({ plushieType = "bear", furColor = "#8d5b4c", accessory = "none" }) {
  const isPanda = plushieType === "panda";
  const isBunny = plushieType === "bunny";

  // Panda has white head/body and black ears/limbs
  const mainColor = isPanda ? "#ffffff" : furColor;
  const darkPartsColor = isPanda ? "#1f1f1f" : furColor;

  return (
    <group position={[0, 0, 0]}>
      {/* ─── BODY ─── */}
      <mesh castShadow receiveShadow position={[0, -0.28, 0]} scale={[1.15, 1.0, 1.05]}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial color={mainColor} roughness={0.85} metalness={0.02} />
      </mesh>

      {/* ─── PANDA BELLY PANEL ─── */}
      {isPanda && (
        <mesh position={[0, -0.25, 0.58]} scale={[0.82, 0.82, 0.1]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.85} />
        </mesh>
      )}

      {/* ─── HEAD ─── */}
      <mesh castShadow position={[0, 0.42, 0.05]} scale={[1.12, 0.95, 1.05]}>
        <sphereGeometry args={[0.58, 32, 32]} />
        <meshStandardMaterial color={mainColor} roughness={0.85} metalness={0.02} />
      </mesh>

      {/* ─── SNOUT / MUZZLE ─── */}
      <mesh position={[0, 0.34, 0.56]} scale={[1.1, 0.85, 0.7]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f5efe6" roughness={0.85} />
      </mesh>

      {/* ─── NOSE ─── */}
      <mesh position={[0, 0.38, 0.68]} scale={[1.2, 0.8, 0.8]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#1f1f1f" roughness={0.9} />
      </mesh>

      {/* ─── CUTE SMILE ─── */}
      <group position={[0, 0.32, 0.68]}>
        {/* Left curve */}
        <mesh position={[-0.032, 0, 0]} rotation={[0, 0, Math.PI]} scale={[0.035, 0.035, 0.02]}>
          <torusGeometry args={[0.8, 0.18, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#1f1f1f" roughness={0.9} />
        </mesh>
        {/* Right curve */}
        <mesh position={[0.032, 0, 0]} rotation={[0, 0, Math.PI]} scale={[0.035, 0.035, 0.02]}>
          <torusGeometry args={[0.8, 0.18, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#1f1f1f" roughness={0.9} />
        </mesh>
      </group>

      {/* ─── BLUSH CHEEKS ─── */}
      <mesh position={[-0.3, 0.35, 0.56]} scale={[0.08, 0.04, 0.04]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ff7a90" roughness={0.9} emissive="#ff7a90" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0.3, 0.35, 0.56]} scale={[0.08, 0.04, 0.04]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ff7a90" roughness={0.9} emissive="#ff7a90" emissiveIntensity={0.15} />
      </mesh>

      {/* ─── EYES ─── */}
      {/* Eye patches for Panda */}
      {isPanda && (
        <>
          <mesh position={[-0.21, 0.44, 0.54]} rotation={[0.08, 0.18, -0.15]} scale={[1.2, 1.4, 0.5]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#1f1f1f" roughness={0.85} />
          </mesh>
          <mesh position={[0.21, 0.44, 0.54]} rotation={[0.08, -0.18, 0.15]} scale={[1.2, 1.4, 0.5]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#1f1f1f" roughness={0.85} />
          </mesh>
        </>
      )}
      
      {/* Left eye */}
      <mesh position={[-0.21, 0.44, 0.56]} scale={[0.045, 0.045, 0.045]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#050505" roughness={0.15} metalness={0.8} />
      </mesh>
      {/* Left eye gloss highlight */}
      <mesh position={[-0.19, 0.46, 0.60]} scale={[0.014, 0.014, 0.014]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Right eye */}
      <mesh position={[0.21, 0.44, 0.56]} scale={[0.045, 0.045, 0.045]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#050505" roughness={0.15} metalness={0.8} />
      </mesh>
      {/* Right eye gloss highlight */}
      <mesh position={[0.23, 0.46, 0.60]} scale={[0.014, 0.014, 0.014]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* ─── EARS ─── */}
      {!isBunny ? (
        // Bear / Panda Ears
        <>
          <group position={[-0.44, 0.82, 0.05]} rotation={[0, 0, 0.35]}>
            <mesh castShadow scale={[1, 1, 0.6]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color={darkPartsColor} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0, 0.07]} scale={[0.6, 0.6, 0.4]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#f3d8c7" roughness={0.85} />
            </mesh>
          </group>
          <group position={[0.44, 0.82, 0.05]} rotation={[0, 0, -0.35]}>
            <mesh castShadow scale={[1, 1, 0.6]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color={darkPartsColor} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0, 0.07]} scale={[0.6, 0.6, 0.4]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#f3d8c7" roughness={0.85} />
            </mesh>
          </group>
        </>
      ) : (
        // Bunny Ears (Floppy ear details!)
        <>
          {/* Left Bunny Ear (Straight/perky) */}
          <group position={[-0.22, 0.92, 0.05]} rotation={[0.08, 0, 0.15]}>
            <mesh castShadow scale={[0.14, 0.65, 0.12]}>
              <sphereGeometry args={[1, 32, 16]} />
              <meshStandardMaterial color={mainColor} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.05, 0.045]} scale={[0.07, 0.48, 0.04]}>
              <sphereGeometry args={[1, 32, 16]} />
              <meshStandardMaterial color="#fda4af" roughness={0.9} />
            </mesh>
          </group>
          
          {/* Right Bunny Ear (Floppy/folded) */}
          <group position={[0.22, 0.92, 0.05]} rotation={[0.08, 0, -0.15]}>
            {/* Ear Base */}
            <group scale={[0.14, 0.35, 0.12]}>
              <mesh castShadow>
                <sphereGeometry args={[1, 32, 16]} />
                <meshStandardMaterial color={mainColor} roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.05, 0.35]} scale={[0.5, 0.7, 0.3]}>
                <sphereGeometry args={[1, 32, 16]} />
                <meshStandardMaterial color="#fda4af" roughness={0.9} />
              </mesh>
            </group>
            {/* Folded Ear Tip */}
            <group position={[0.05, 0.22, 0.05]} rotation={[1.4, 0.1, -0.4]} scale={[0.14, 0.35, 0.12]}>
              <mesh castShadow>
                <sphereGeometry args={[1, 32, 16]} />
                <meshStandardMaterial color={mainColor} roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.05, 0.35]} scale={[0.5, 0.7, 0.3]}>
                <sphereGeometry args={[1, 32, 16]} />
                <meshStandardMaterial color="#fda4af" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </>
      )}

      {/* ─── ARMS / PAWS ─── */}
      <mesh castShadow position={[-0.48, -0.18, 0.28]} rotation={[0.3, 0.5, -0.4]} scale={[0.24, 0.38, 0.24]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={darkPartsColor} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.48, -0.18, 0.28]} rotation={[0.3, -0.5, 0.4]} scale={[0.24, 0.38, 0.24]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={darkPartsColor} roughness={0.85} />
      </mesh>

      {/* ─── LEGS / FEET ─── */}
      <group position={[-0.36, -0.72, 0.35]} rotation={[-0.1, 0.2, -0.05]}>
        <mesh castShadow scale={[0.26, 0.24, 0.42]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={darkPartsColor} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.02, 0.24]} rotation={[Math.PI / 2, 0, 0]} scale={[0.16, 0.03, 0.2]}>
          <cylinderGeometry args={[1, 1, 1, 16]} />
          <meshStandardMaterial color="#fbc4ab" roughness={0.9} />
        </mesh>
      </group>
      <group position={[0.36, -0.72, 0.35]} rotation={[-0.1, -0.2, 0.05]}>
        <mesh castShadow scale={[0.26, 0.24, 0.42]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={darkPartsColor} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.02, 0.24]} rotation={[Math.PI / 2, 0, 0]} scale={[0.16, 0.03, 0.2]}>
          <cylinderGeometry args={[1, 1, 1, 16]} />
          <meshStandardMaterial color="#fbc4ab" roughness={0.9} />
        </mesh>
      </group>

      {/* ─── TAIL ─── */}
      <mesh castShadow position={[0, -0.62, -0.55]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={darkPartsColor} roughness={0.85} />
      </mesh>

      {/* ─── ACCESSORIES ─── */}
      {accessory === "bowtie" && (
        <group position={[0, 0.16, 0.52]}>
          {/* Left loop */}
          <mesh position={[-0.08, 0, 0.02]} rotation={[0, 0, -0.2]} scale={[0.12, 0.06, 0.06]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#ec4899" roughness={0.15} metalness={0.65} />
          </mesh>
          {/* Right loop */}
          <mesh position={[0.08, 0, 0.02]} rotation={[0, 0, 0.2]} scale={[0.12, 0.06, 0.06]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#ec4899" roughness={0.15} metalness={0.65} />
          </mesh>
          {/* Left Tail */}
          <mesh position={[-0.05, -0.08, 0.01]} rotation={[0, 0, 0.6]} scale={[0.03, 0.08, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ec4899" roughness={0.15} metalness={0.65} />
          </mesh>
          {/* Right Tail */}
          <mesh position={[0.05, -0.08, 0.01]} rotation={[0, 0, -0.6]} scale={[0.03, 0.08, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ec4899" roughness={0.15} metalness={0.65} />
          </mesh>
          {/* Middle knot */}
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#ec4899" roughness={0.15} metalness={0.65} />
          </mesh>
        </group>
      )}

      {accessory === "glasses" && (
        <group position={[0, 0.44, 0.56]}>
          {/* Left Frame */}
          <mesh position={[-0.18, 0, 0.06]}>
            <torusGeometry args={[0.09, 0.012, 8, 32]} />
            <meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Left Glass Lens */}
          <mesh position={[-0.18, 0, 0.06]}>
            <cylinderGeometry args={[0.085, 0.085, 0.003, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.25} roughness={0.0} metalness={0.9} />
          </mesh>
          {/* Right Frame */}
          <mesh position={[0.18, 0, 0.06]}>
            <torusGeometry args={[0.09, 0.012, 8, 32]} />
            <meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Right Glass Lens */}
          <mesh position={[0.18, 0, 0.06]}>
            <cylinderGeometry args={[0.085, 0.085, 0.003, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.25} roughness={0.0} metalness={0.9} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0, 0.015, 0.075]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
            <meshStandardMaterial color="#d4af37" roughness={0.1} metalness={0.9} />
          </mesh>
        </group>
      )}

      {accessory === "heart" && (
        <group position={[0, -0.16, 0.58]}>
          {/* Heart Left Lobe */}
          <mesh position={[-0.08, 0.08, 0]}>
            <sphereGeometry args={[0.14, 24, 24]} />
            <meshStandardMaterial color="#ec4899" roughness={0.12} metalness={0.15} />
          </mesh>
          {/* Heart Right Lobe */}
          <mesh position={[0.08, 0.08, 0]}>
            <sphereGeometry args={[0.14, 24, 24]} />
            <meshStandardMaterial color="#ec4899" roughness={0.12} metalness={0.15} />
          </mesh>
          {/* Heart Bottom Cone */}
          <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.16, 0.28, 24]} />
            <meshStandardMaterial color="#ec4899" roughness={0.12} metalness={0.15} />
          </mesh>
        </group>
      )}

      {accessory === "star" && (
        <group position={[0, -0.16, 0.58]} scale={[0.8, 0.8, 0.8]}>
          {/* Center sphere */}
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.08} metalness={0.85} />
          </mesh>
          {/* Top Point */}
          <mesh position={[0, 0.16, 0]}>
            <coneGeometry args={[0.075, 0.2, 5]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.08} metalness={0.85} />
          </mesh>
          {/* Bottom-Left Point */}
          <mesh position={[-0.1, -0.12, 0]} rotation={[0, 0, 2.3]}>
            <coneGeometry args={[0.075, 0.2, 5]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.08} metalness={0.85} />
          </mesh>
          {/* Bottom-Right Point */}
          <mesh position={[0.1, -0.12, 0]} rotation={[0, 0, -2.3]}>
            <coneGeometry args={[0.075, 0.2, 5]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.08} metalness={0.85} />
          </mesh>
          {/* Top-Left Point */}
          <mesh position={[-0.14, 0.05, 0]} rotation={[0, 0, 1.25]}>
            <coneGeometry args={[0.075, 0.2, 5]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.08} metalness={0.85} />
          </mesh>
          {/* Top-Right Point */}
          <mesh position={[0.14, 0.05, 0]} rotation={[0, 0, -1.25]}>
            <coneGeometry args={[0.075, 0.2, 5]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.08} metalness={0.85} />
          </mesh>
        </group>
      )}

      {accessory === "balloon" && (
        <group position={[0.48, -0.18, 0.28]}>
          {/* Balloon string */}
          <mesh position={[0.0, 0.45, 0.02]} rotation={[0.05, 0, -0.05]}>
            <cylinderGeometry args={[0.005, 0.005, 0.9, 8]} />
            <meshStandardMaterial color="#a8a29e" />
          </mesh>
          {/* Balloon */}
          <mesh castShadow position={[0.05, 1.0, 0.05]} scale={[1, 1.28, 1]}>
            <sphereGeometry args={[0.26, 32, 32]} />
            <meshStandardMaterial color="#ec4899" roughness={0.1} metalness={0.15} />
          </mesh>
          {/* Balloon knot */}
          <mesh position={[0.05, 0.72, 0.05]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.035, 0.05, 8]} />
            <meshStandardMaterial color="#ec4899" />
          </mesh>
        </group>
      )}
    </group>
  );
}
