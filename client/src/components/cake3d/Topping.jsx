const sprinkleColors = ["#4dd4f0", "#ff6b9a", "#ffe066", "#95de64", "#b197fc"];

export default function Topping({ topping }) {
  const position = [topping.x, topping.y, topping.z];

  if (topping.type === "cherry") {
    return (
      <group position={position}>
        <mesh castShadow>
          <sphereGeometry args={[0.095, 24, 18]} />
          <meshStandardMaterial color="#c71f37" roughness={0.36} metalness={0.05} />
        </mesh>
        <mesh position={[0.035, 0.09, 0]} rotation={[0.25, 0.15, -0.45]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
          <meshStandardMaterial color="#375b2a" roughness={0.65} />
        </mesh>
      </group>
    );
  }

  if (topping.type === "chip") {
    return (
      <mesh position={position} rotation={[0.2, topping.rotation, 0.25]} castShadow>
        <coneGeometry args={[0.075, 0.105, 5]} />
        <meshStandardMaterial color="#352019" roughness={0.7} />
      </mesh>
    );
  }

  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, topping.rotation]} castShadow>
      <boxGeometry args={[0.18, 0.025, 0.04]} />
      <meshStandardMaterial
        color={sprinkleColors[topping.colorIndex % sprinkleColors.length]}
        roughness={0.44}
      />
    </mesh>
  );
}
