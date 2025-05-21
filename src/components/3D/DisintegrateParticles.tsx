// src/components/3D/DisintegrateParticles.tsx

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { MotionValue } from "framer-motion";

// Importe shaders externos
import vertexShader from "./shaders/disintegrateVertex.glsl";
import fragmentShader from "./shaders/disintegrateFragment.glsl";
import type { PerspectiveCamera } from "three";

// Cria o material customizado para partículas
const DisintegrateMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uScale: 1,
  },
  vertexShader,
  fragmentShader
);

extend({ DisintegrateMaterial });

export function DisintegrateParticles({
  scrollYProgress,
  scale,
}: {
  scrollYProgress: MotionValue<number>;
  scale: MotionValue<number>;
}) {
  const ref = useRef<any>(null!);
  const { size, camera } = useThree(); // Para obter largura e altura reais da viewport
  const perspectiveCamera = camera as PerspectiveCamera;

  // Gere um grid de partículas para preencher perfeitamente um retângulo
  const { positions } = useMemo(() => {
    // const count = particleCount.get(); // Aumenta a densidade
    const count = 800000; // Aumenta a densidade
    const fov = perspectiveCamera.fov * (Math.PI / 180);
    const z = perspectiveCamera.position.z;
    const height = 2 * Math.tan(fov / 2) * z;
    const width = height * (size.width / size.height);

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() - 0.5) * width;
      positions[i3 + 1] = (Math.random() - 0.5) * height;
      positions[i3 + 2] = 0; // Pode deixar 0 se não quiser profundidade
    }

    return { positions };
  }, [perspectiveCamera.fov, perspectiveCamera.position.z, size]);

  useFrame(() => {
    if (ref.current) {
      ref.current.uTime += 0.01;
      ref.current.uProgress = scrollYProgress.get();
      ref.current.uScale = scale.get();
    }
  });

  return (
    <points>
      <bufferGeometry>
        {/* args=[array, itemSize] garante c/ TS */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <disintegrateMaterial ref={ref} transparent />
    </points>
  );
}
