import { Canvas } from "@react-three/fiber";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import LowPolyStar from "./Star";
import {
  Bloom,
  ToneMapping,
  EffectComposer,
} from "@react-three/postprocessing";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export const AnimatedStarWithText: React.FC<{
  isVisible: boolean;
  starAnimation: boolean;
  scrollProgress: number;
}> = ({ isVisible, starAnimation, scrollProgress }) => {
  const starColor = useMemo(() => new THREE.Color(0x000ff), []);
  const progress = useMotionValue(0);
  const springProgress = useSpring(progress, { stiffness: 100, damping: 20 });

  // Scale starts at 0.05 for a reference viewport width (e.g., 1920px)
  const scale = useMotionValue(0.025);

  // Update scale based on viewport width
  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      // Scale decreases subtly: 0.05 at 1920px, down to 0.03 at 320px
      const newScale =
        0.01 + ((viewportWidth - 320) * (0.025 - 0.01)) / (1920 - 320);
      scale.set(Math.max(0.01, newScale)); // Ensure scale doesn't go below 0.03
    };

    updateScale(); // Initial scale
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [scale]);

  // Define parabolic path: y = a * x^2 + b * x + c
  // Start: (0, 0) [top: 0, right: 0]
  // Midpoint: (0.8, 0.3) [right: 20%, bottom: 30%]
  // End: (0.5, 0.5) [right: 50%, bottom: 50%]
  const getParabolicPosition = (t: number) => {
    // Parabola coefficients calculated to pass through (0,0), (0.8,0.3), (0.5,0.5)
    const a = 0.83333; // Derived from solving parabola equation
    const b = -0.91667;
    const c = 0.1;
    const x = t; // t goes from 0 to 1
    const y = a * x * x + b * x + c;
    return { right: `${(1 - x) * 100 - 30}%`, bottom: `${y * 100 + 2}%` };
  };

  const right = useTransform(springProgress, [0, 1], ["0%", "100%"], {
    mixer: () => (t) => {
      const { right } = getParabolicPosition(t);
      return right;
    },
  });
  const bottom = useTransform(springProgress, [0, 1], ["0%", "80%"], {
    mixer: () => (t) => {
      const { bottom } = getParabolicPosition(t);
      return bottom;
    },
  });

  const rawScroll = useMotionValue(scrollProgress);
  const springScroll = useSpring(rawScroll, { stiffness: 100, damping: 20 });
  const x = useTransform(springScroll, [0, 1], ["-100%", "0%"]);

  useEffect(() => {
    progress.set(starAnimation ? 1 : 0);
  }, [starAnimation, progress]);

  return (
    <section className="text-white">
      {x.get()}
      {starAnimation && (
        <div className="text-white h-full items-center gap-4">
          <motion.h1
            initial={{ left: "-100%", top: "0%" }}
            className="absolute top-36 text-black text-3xl md:text-5xl font-bold opacity-[0.5] text-nowrap text-start"
            style={{
              x: x.get(),
              textShadow: `
                /* contorno azul */
                -1px -1px 0 #3b82f6,
                1px -1px 0 #3b82f6,
                -1px  1px 0 #3b82f6,
                1px  1px 0 #3b82f6,

                /* brilho branco suave */
                0 0 50px rgba(0, 0, 255, 0.5),
                0 0 50px rgba(0, 0, 255, 0.5)
              `,
            }}
          >
            SOBRE MIM
          </motion.h1>

          <p className="absolute z-10">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Repudiandae, asperiores. Adipisci, neque dolorem? Laboriosam ducimus
            quo maxime quaerat, a deserunt voluptatibus sapiente repellendus,
            perferendis enim consectetur? Natus nam pariatur sint!
          </p>
        </div>
      )}

      <motion.div
        className="fixed flex justify-between flex-col w-screen h-screen pointer-events-none z-10"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 1s ease",
          right,
          bottom,
        }}
      >
        <Canvas
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          camera={{ position: [0, 0, 40] }}
        >
          <EffectComposer>
            <Bloom
              mipmapBlur
              luminanceThreshold={0}
              levels={7}
              intensity={0.8}
            />
            <ToneMapping />
          </EffectComposer>
          <LowPolyStar color={starColor} scale={scale.get()} />
        </Canvas>
      </motion.div>
    </section>
  );
};
