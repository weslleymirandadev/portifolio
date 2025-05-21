import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Icosahedron } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Glitch, Bloom, ToneMapping } from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import { pointsInner, pointsOuter } from "../../utils/3D_Gradients";

// Types
interface Position {
  x: number;
  y: number;
  z: number;
}

interface PortfolioSection {
  title: string;
  position: Position;
}

interface BlackHoleProps {
  glitchActive: boolean;
  scrollProgress?: number;
}

// Cache for geometries and materials
const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const pointMaterial = new THREE.MeshStandardMaterial({
  emissive: new THREE.Color("#000000"),
  emissiveIntensity: 0.5,
  roughness: 0.5,
  color: "#000000",
});

const centralMaterial = new THREE.MeshStandardMaterial({
  color: "#000000",
  wireframe: true,
  emissive: new THREE.Color("#ff0000"),
  emissiveIntensity: 10,
  roughness: 0.2,
  metalness: 0.8,
  toneMapped: false,
});

// Utility function for debouncing
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const AnimatedPoints: React.FC = () => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const { mouse } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const targetPositions = useMemo<PortfolioSection[]>(
    () => [
      { title: "Sobre", position: { x: 5, y: 0, z: 0 } },
      { title: "Projetos", position: { x: 0, y: 5, z: 0 } },
      { title: "Contato", position: { x: -5, y: 0, z: 0 } },
    ],
    []
  );

  // Combine points and initialize instance matrices
  const allPoints = useMemo(() => [...pointsInner, ...pointsOuter], []);
  const instanceCount = allPoints.length;

  useEffect(() => {
    if (instancedMeshRef.current) {
      allPoints.forEach((point, i) => {
        dummy.position.set(...point.position);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, allPoints]);

  useFrame(({ clock }) => {
    if (!instancedMeshRef.current) return;

    const time = clock.getElapsedTime();
    instancedMeshRef.current.rotation.z = time * 0.05;

    allPoints.forEach((point, i) => {
      dummy.position.set(...point.position);
      const distance = dummy.position.distanceTo(new THREE.Vector3(mouse.x * 10, mouse.y * 10, 0));
      dummy.scale.setScalar(distance < 2 ? 1.2 : 1);

      if (i < targetPositions.length && time > 5) {
        const target = targetPositions[i].position;
        const delay = i * 0.5;
        if (time > 5 + delay) {
          dummy.position.lerp(
            new THREE.Vector3(target.x, target.y, target.z),
            0.05
          );
        }
      } else {
        dummy.position.add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.03
          )
        );
      }

      dummy.updateMatrix();
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[sphereGeometry, pointMaterial, instanceCount]}
    />
  );
};

const CentralObject: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const cameraTarget = useMemo(
    () => ({
      position: new THREE.Vector3(10, -17.5, 10),
      lookAt: new THREE.Vector3(0, 0, 0),
    }),
    []
  );

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      ref.current.rotation.set(time * 0.5, time * 0.5, time * 0.5);

      const initialPosition = new THREE.Vector3(10, -17.5, 10);
      const targetPosition = new THREE.Vector3(0, 0, 0);
      const currentPosition = initialPosition.lerp(targetPosition, scrollProgress);

      cameraTarget.position.copy(currentPosition);
      camera.position.lerp(cameraTarget.position, 0.05);
      camera.lookAt(cameraTarget.lookAt);
    }
  });

  return (
    <Icosahedron ref={ref} args={[1, 1]} scale={5} position={[0, 0, 0]}>
      <primitive object={centralMaterial} attach="material" />
    </Icosahedron>
  );
};

export const BlackHole: React.FC<BlackHoleProps> = ({
  glitchActive,
  scrollProgress = 0,
}) => {
  const [internalGlitchActive, setInternalGlitchActive] = useState(false);
  const [scroll, setScroll] = useState(scrollProgress);

  useEffect(() => {
    const triggerGlitch = () => {
      setInternalGlitchActive(true);
      setTimeout(() => setInternalGlitchActive(false), 200);
    };

    const handleScroll = debounce(() => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      setScroll(progress);
    }, 16); // ~60fps

    const glitchInterval = setInterval(triggerGlitch, 5000 + Math.random() * 5000);
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(glitchInterval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative w-full h-[100dvh]">
      <Canvas
        camera={{ position: [10, -17.5, 10] }}
        style={{ height: "100dvh" }}
        className="bg-[#320809]"
      >
        <directionalLight intensity={1} />
        <ambientLight intensity={0.5} />
        <fog attach="fog" args={["red", 10, 70]} />
        <AnimatedPoints />
        <CentralObject scrollProgress={scroll} />
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
      </Canvas>
    </div>
  );
};