export default function CreamSwirl({ position }) {
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position={[0, 0.04, 0]} castShadow>
        <torusGeometry args={[0.105, 0.032, 12, 28]} />
        <meshStandardMaterial color="#fff8e8" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.11, 0]} scale={[0.82, 0.55, 0.82]} castShadow>
        <sphereGeometry args={[0.095, 24, 18]} />
        <meshStandardMaterial color="#fffdf3" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.2, 0]} scale={[0.48, 0.72, 0.48]} castShadow>
        <coneGeometry args={[0.08, 0.18, 28]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.4} />
      </mesh>
    </group>
  );
}
