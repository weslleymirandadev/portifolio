import React, { useEffect, useRef, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Interface para as props do componente
interface LowPolyStarProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  speed?: number;
  path?: string;
}

// Componente LowPolyStar
const LowPolyStar: React.FC<LowPolyStarProps> = ({
  position = [0, 0, 0],
  scale = 0.025,
  rotation = [0, 0, 0],
  path = "src/components/3D/models/star/star.glb", // Ajustado para caminho relativo à raiz
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const ref = useRef<THREE.Group>(null);

  // Carregar o modelo GLTF com depuração
  useEffect(() => {
    const loader = new GLTFLoader();
    console.log("Tentando carregar o modelo de:", path);

    loader.load(
      path,
      (gltf: { scene: any }) => {
        console.log("Modelo carregado com sucesso:", gltf.scene);
        const scene = gltf.scene;
        scene.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            console.log(
              "Mesh encontrado:",
              child.name,
              "Geometria:",
              child.geometry,
              "Material:",
              child.material
            );

            // Substituir o material por wireframe verde
            child.material = new THREE.MeshStandardMaterial({
              color: 0x05df72, // vermelho sólido
              emissive: 0x05df72, // brilho amarelo
              emissiveIntensity: 10,
              roughness: 0.2,
              metalness: 0.8,
              toneMapped: false,
              wireframe: true,
            });
          }
        });

        setModel(scene);
      },
      (progress: any) => {
        console.log("Progresso do carregamento:", progress);
      },
      (error: any) => {
        console.error("Erro ao carregar o modelo GLTF:", error);
      }
    );
  }, [path]);

  const speed = 0.5;

  useFrame(() => {
    if (ref.current) {
    //   ref.current.rotation.y += speed * 0.05;
    }
  });

  return model ? (
    <group ref={ref} position={position} scale={scale} rotation={rotation}>
      <primitive object={model} />
    </group>
  ) : (
    <mesh visible={false}>Carregando...</mesh>
  );
};

export default LowPolyStar;
