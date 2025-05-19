// ShootingStarsCanvas.tsx
import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import StarsGroup from "./StarsGroup";

export default function ShootingStarsCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 40], fov: 45 }}
      className="fixed top-0 left-0 w-full h-full z-10"
    >
      <ScrollControls pages={1}>
        <StarsGroup />
      </ScrollControls>
    </Canvas>
  );
}
