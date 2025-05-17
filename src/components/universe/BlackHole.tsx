import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Glitch } from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import { pointsInner, pointsOuter } from "../../utils/3D_Gradients";

export const BlackHole = () => {
  const [glitchActive, setGlitchActive] = useState(false);

  // Trigger glitch randomly every 5–10 seconds
  useEffect(() => {
    const triggerGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150); // Glitch lasts 150ms
    };

    const interval = setInterval(
      triggerGlitch,
      5000 + Math.random() * 5000 // Random interval between 5–10s
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <Canvas
        camera={{
          position: [10, -7.5, 5], // Mirrored to the right
        }}
        style={{ height: "100vh" }}
        className="bg-neutral-900" // White background
      >
        <directionalLight />
        <pointLight position={[-30, 0, -30]} power={10.0} />
        <PointCircle />
        <EffectComposer>
          <Glitch
            delay={new THREE.Vector2(0, 0)} // No delay for instant effect
            duration={new THREE.Vector2(0.1, 0.5)} // Short glitch duration
            strength={new THREE.Vector2(0.1, 0.5)} // Subtle distortion
            mode={GlitchMode.SPORADIC} // Random glitch pattern
            active={glitchActive} // Enable only when active
            ratio={0.5} // Moderate chromatic aberration
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

const PointCircle = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      // Continuous rotation
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;

      // Subtle earthquake effect
      ref.current.position.x = (Math.random() - 0.5) * 0.02; // ±0.01 offset
      ref.current.position.y = (Math.random() - 0.5) * 0.02;
      ref.current.position.z = (Math.random() - 0.5) * 0.02;
    }
  });

  return (
    <group ref={ref}>
      {pointsInner.map((point) => (
        <Point
          key={point.idx}
          position={[
            point.position[0] ?? 0,
            point.position[1] ?? 0,
            point.position[2] ?? 0,
          ]}
          color="#000000" // Black spheres
        />
      ))}
      {pointsOuter.map((point) => (
        <Point
          key={point.idx}
          position={[
            point.position[0] ?? 0,
            point.position[1] ?? 0,
            point.position[2] ?? 0,
          ]}
          color="#000000" // Black spheres
        />
      ))}
    </group>
  );
};

type PointProps = {
  position: [number, number, number];
  color: string;
};

const Point = ({ position, color }: PointProps) => {
  return (
    <Sphere position={position} args={[0.1, 10, 10]}>
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.5}
        color={color}
      />
    </Sphere>
  );
};