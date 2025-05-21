import { useEffect, useRef, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface LowPolyStarProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  speed?: number;
  color: THREE.Color;
  path?: string;
}

const LowPolyStar: React.FC<LowPolyStarProps> = ({
  position = [0, 0, 0],
  scale = 0.025, // Increased scale for better visibility
  rotation = [0, 0, 0],
  speed = 0.05,
  color = new THREE.Color(0x00ff00),
  path = "src/components/3D/models/star/star.glb",
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(
    new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 10,
      roughness: 0.2,
      metalness: 0.8,
      toneMapped: false,
      wireframe: true,
    })
  );

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        const scene = gltf.scene;
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = materialRef.current; // Apply shared material
          }
        });
        setModel(scene);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );
  }, [path]);

  useEffect(() => {
    // Update material properties when color changes
    materialRef.current.color.set(color);
    materialRef.current.emissive.set(color);
  }, [color]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += speed;
    }
  });

  return model ? (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      <primitive object={model} />
    </group>
  ) : (
    <mesh visible={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

export default LowPolyStar;