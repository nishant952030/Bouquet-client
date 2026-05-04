import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import Cake from "./Cake.jsx";

export default function CakeScene({
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
  return (
    <Canvas
      camera={{ position: [0, 3.2, 7.5], fov: 45 }}
      dpr={[1, 1.7]}
      shadows
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#fff7ee"]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        intensity={2.1}
        position={[3.5, 5, 4]}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={12}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <spotLight position={[-4, 4.5, 3]} angle={0.35} penumbra={0.65} intensity={0.9} />

      <Cake
        activeTool={activeTool}
        autoRotate={autoRotate}
        candles={candles}
        creamSwirls={creamSwirls}
        extinguishedCandleIds={extinguishedCandleIds}
        flavor={flavor}
        readOnly={readOnly}
        selectedTopping={selectedTopping}
        tiers={tiers}
        toppings={toppings}
        onPlaceCandle={onPlaceCandle}
        onPlaceCream={onPlaceCream}
        onPlaceTopping={onPlaceTopping}
        onCandleBlow={onCandleBlow}
      />

      <ContactShadows position={[0, -0.12, 0]} opacity={0.28} scale={7} blur={2.6} far={3} />
      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0.48, 0]}
        minDistance={3.8}
        maxDistance={9.5}
        minPolarAngle={Math.PI / 4.2}
        maxPolarAngle={Math.PI / 2.15}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
      />
    </Canvas>
  );
}
