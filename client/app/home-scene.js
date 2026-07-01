"use client";

import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";

const Petal = ({ color, position, rotation, scale }) => {
  const mesh = useRef();
  const [speed] = useState(() => 0.1 + Math.random() * 0.4);
  
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += speed * 0.05;
    mesh.current.rotation.z += speed * 0.02;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={position} rotation={rotation}>
      <mesh ref={mesh} scale={[scale, scale * 0.1, scale * 0.5]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

const SceneBackground = () => {
  const [petals] = useState(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8 - 2
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: 0.5 + Math.random() * 1.5,
      color: i % 2 === 0 ? '#e48d9c' : '#fbc4ab'
    }));
  });

  return (
    <group>
      {petals.map((props, i) => <Petal key={i} {...props} />)}
      <ContactShadows position={[0, -4, 0]} opacity={0.3} scale={20} blur={2} far={4.5} />
    </group>
  );
};

export default function HomeScene() {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#fff5f6" />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <SceneBackground />
      <Suspense fallback={null}>
        <Environment preset="dawn" />
      </Suspense>
    </Canvas>
  );
}
