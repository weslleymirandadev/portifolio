import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import {
  EffectComposer,
  Glitch,
  Bloom,
  ToneMapping,
} from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import { pointsInner, pointsOuter } from "../../utils/3D_Gradients";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface PortfolioSection {
  title: string;
  position: Position;
}

interface AnimatedPointsProps {
  onTransitionComplete: () => void;
}

interface PointProps {
  position: [number, number, number];
  color: string;
}

interface CentralObjectProps {
  glowIntensity: number;
  glowColor: string;
  objectColor: string;
  scrollProgress: number;
}

export const BlackHole = ({
  glitchActive,
  scrollProgress = 0,
}: {
  glitchActive: boolean;
  scrollProgress?: number;
}) => {
  const [internalGlitchActive, setInternalGlitchActive] = useState(false);
  const [scroll, setScrollProgress] = useState(0);

  useEffect(() => {
    const triggerGlitch = () => {
      setInternalGlitchActive(true);
      setTimeout(() => setInternalGlitchActive(false), 200);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);
      scrollProgress = scroll;
    };

    const glitchInterval = setInterval(triggerGlitch, 5000 + Math.random() * 5000);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(glitchInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      <Canvas
        camera={{ position: [10, -17.5, 10] }}
        style={{ height: "100dvh" }}
        className="bg-[#320809]"
      >
        <directionalLight />
        <ambientLight intensity={0.5} />

        <AnimatedPoints onTransitionComplete={() => {}} />

        <CentralObject
          glowIntensity={10}
          glowColor={"#ff0000"}
          objectColor={"#000000"}
          scrollProgress={scrollProgress}
        />

        <EffectComposer>
          <Glitch
            delay={new THREE.Vector2(0, 0)}
            duration={new THREE.Vector2(0.1, 0.5)}
            strength={new THREE.Vector2(0.1, 0.5)}
            mode={GlitchMode.SPORADIC}
            active={glitchActive || internalGlitchActive}
            ratio={0.5}
          />
          <Bloom mipmapBlur luminanceThreshold={0} levels={7} intensity={0.8} />
          <ToneMapping />
        </EffectComposer>
        <fog attach="fog" args={["red", 10, 70]} />
      </Canvas>
    </div>
  );
};

const AnimatedPoints = ({ onTransitionComplete }: AnimatedPointsProps) => {
  const ref = useRef<THREE.Group>(null);
  const [transitionActive, setTransitionActive] = useState<boolean>(false);
  const [targetPositions, setTargetPositions] = useState<PortfolioSection[]>([]);

  useEffect(() => {
    const sections: PortfolioSection[] = [
      { title: "Sobre", position: { x: 5, y: 0, z: 0 } },
      { title: "Projetos", position: { x: 0, y: 5, z: 0 } },
      { title: "Contato", position: { x: -5, y: 0, z: 0 } },
    ];
    setTargetPositions(sections);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransitionActive(true);
      const transitionTimer = setTimeout(() => {
        onTransitionComplete();
      }, 4000);
      return () => clearTimeout(transitionTimer);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onTransitionComplete]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;
      ref.current.position.x = (Math.random() - 0.5) * 0.02;
      ref.current.position.y = (Math.random() - 0.5) * 0.02;
      ref.current.position.z = (Math.random() - 0.5) * 0.02;

      if (transitionActive) {
        const elapsed = clock.getElapsedTime() - 5;
        ref.current.children.forEach((child, index) => {
          if (index < targetPositions.length && "position" in child) {
            const target = new THREE.Vector3(
              targetPositions[index].position.x,
              targetPositions[index].position.y,
              targetPositions[index].position.z
            );
            const delay = index * 0.5;
            if (elapsed > delay) {
              (child.position as THREE.Vector3).lerp(target, 0.05);
            }
          } else {
            if ("position" in child) {
              child.position.x += (Math.random() - 0.5) * 0.03;
              child.position.y += (Math.random() - 0.5) * 0.03;
              child.position.z += (Math.random() - 0.5) * 0.03;
            }
          }
        });
      }
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
          color="#000000"
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
          color="#000000"
        />
      ))}
    </group>
  );
};

const Point = ({ position, color }: PointProps) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ mouse }) => {
    if (ref.current) {
      const distance = ref.current.position.distanceTo(
        new THREE.Vector3(mouse.x * 10, mouse.y * 10, 0)
      );
      ref.current.scale.set(distance < 2 ? 1.2 : 1, distance < 2 ? 1.2 : 1, 1);
    }
  });

  return (
    <Sphere ref={ref} position={position} args={[0.1, 10, 10]}>
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.5}
        color={color}
      />
    </Sphere>
  );
};

const CentralObject = ({
  glowIntensity,
  glowColor,
  objectColor,
  scrollProgress,
}: CentralObjectProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const cameraTarget = useRef({
    position: new THREE.Vector3(10, -17.5, 10),
    lookAt: new THREE.Vector3(0, 0, 0),
  });

  useFrame(({ camera, clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.5;
      ref.current.rotation.y = clock.getElapsedTime() * 0.5;
      ref.current.rotation.z = clock.getElapsedTime() * 0.5;

      const initialPosition = new THREE.Vector3(10, -17.5, 10);
      const targetPosition = new THREE.Vector3(0, 0, 0);
      const currentPosition = initialPosition.clone().lerp(targetPosition, scrollProgress);

      cameraTarget.current.position.copy(currentPosition);
      camera.position.lerp(cameraTarget.current.position, 0.05);
      camera.lookAt(cameraTarget.current.lookAt);
    }
  });

  return (
    <mesh
      ref={ref}
      scale={5}
      position={[0, 0, 0]}
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={objectColor}
        wireframe={true}
        emissive={glowColor}
        emissiveIntensity={glowIntensity}
        roughness={0.2}
        metalness={0.8}
        toneMapped={false}
      />
    </mesh>
  );
};