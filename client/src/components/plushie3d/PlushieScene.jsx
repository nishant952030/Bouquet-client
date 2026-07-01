import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import Plushie from "./Plushie";
import PlushieBox from "./PlushieBox";

export default function PlushieScene({
  plushieType = "bear",
  furColor = "#8d5b4c",
  accessory = "none",
  boxStyle = "romantic",
  isOpen = false,
  autoRotate = false
}) {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 6.2], fov: 45 }}
      dpr={[1, 1.7]}
      shadows
      gl={{ antialias: true, alpha: true }}
    >

      
      {/* Lights */}
      <ambientLight intensity={0.65} />
      <directionalLight
        castShadow
        intensity={1.8}
        position={[4, 5, 3]}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={10}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <spotLight position={[-4, 4.5, 3]} angle={0.35} penumbra={0.6} intensity={0.8} />

      {/* Box and Plushie */}
      <PlushieBox boxStyle={boxStyle} isOpen={isOpen}>
        <Plushie plushieType={plushieType} furColor={furColor} accessory={accessory} />
      </PlushieBox>

      {/* Shadows and Environment */}
      <ContactShadows position={[0, -1.02, 0]} opacity={0.25} scale={6.5} blur={2.4} far={2.5} />
      
      <Suspense fallback={null}>
        <Environment preset="sunset" />
      </Suspense>

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        target={[0, 0.1, 0]}
        minDistance={3.5}
        maxDistance={8.5}
        minPolarAngle={Math.PI / 4.2}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
