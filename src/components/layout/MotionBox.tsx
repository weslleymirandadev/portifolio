import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { MotionValue, useTransform } from "framer-motion";
import { DisintegrateParticles } from "../3D/DisintegrateParticles";

interface MotionBoxProps {
  scrollYProgress: MotionValue<number>;
  isVisible: boolean;
  onWidthChange: (width: string | number) => void;
}

export const MotionBox: React.FC<MotionBoxProps> = ({
  scrollYProgress,
  isVisible,
  onWidthChange,
}) => {
  const width = useTransform(
    scrollYProgress,
    [0.25, 0.5, 1],
    ["16rem", "100vw", "100vw"]
  );

  // Chamando callback quando a largura muda
  useEffect(() => {
    const unsubscribe = width.on("change", (latest) => onWidthChange(latest));
    return () => unsubscribe();
  }, [width, onWidthChange]);

  // Determinar visibilidade com scroll
  const progress = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0.25, 0.5], [0.1, 1.0]);
  const display = useTransform(scrollYProgress, (progress: number) =>
    progress >= 0.75 ? "none" : "flex"
  );

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-20"
      style={{ display: display.get() }}
    >
      {width.get() !== "100vw" ? (
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 5]} />
          <DisintegrateParticles
            scrollYProgress={progress}
            scale={scale}
          />
        </Canvas>
      ) : (
        <div className="absolute top-0 left-0 w-full h-full bg-black" />
      )}      
    </div>
  );
};
