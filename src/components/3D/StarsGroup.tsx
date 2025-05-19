import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import LowPolyStar from "./Star";

export default function StarsGroup() {
  const group = useRef<THREE.Group>(null);
  const starsCount = 2;
  const stars = useMemo(() => Array.from({ length: starsCount }), []);

  // Scroll progress state
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll to update progress
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      // Prevent division by zero
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);
      // Debugging log
      console.log("Scroll Progress:", progress);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Define the curve for star movement
  const curves = useMemo(() => {
    // Camera frustum assumptions (adjust based on your camera)
    const viewHeight = 10; // Vertical field of view in Three.js units
    const aspect = window.innerWidth / window.innerHeight;
    const viewWidth = viewHeight * aspect;

    return stars.map((_, i) => {
      const delay = i * 0.1; // Delay for trailing effect

      // Path points:
      // - Start: top-right (top-0, right-0) -> (viewWidth/2, viewHeight/2, 0)
      // - Mid: bottom-30%, right-30% -> (viewWidth/2 * 0.4, -viewHeight/2 * 0.4, 0)
      // - End: center, side by side -> (-0.5 + i * 1, 0, 0)
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(viewWidth / 2, viewHeight / 2, 0), // Top-right
        new THREE.Vector3(viewWidth / 2 * 0.4, -viewHeight / 2 * 0.4, 0), // Bottom-30%, right-30%
        new THREE.Vector3(-0.5 + i * 1, 0, 0), // Center, spaced 1 unit apart
      ]);

      // Debugging: Log curve points
      console.log(`Star ${i} Curve Points:`, path.points);

      return { path, delay };
    });
  }, [stars]);

  // Animate stars along the curve
  useFrame(() => {
    if (!group.current) return;

    group.current.children.forEach((child, i) => {
      const { path, delay } = curves[i];
      // Adjust progress with delay
      const localProgress = Math.min(1, Math.max(0, (scrollProgress - delay) / (1 - delay)));
      const pos = path.getPoint(localProgress);
      child.position.copy(pos);
      // Debugging: Log star position
      console.log(`Star ${i} Progress: ${localProgress}, Position:`, pos);
    });
  });

  return (
    <group ref={group}>
      {stars.map((_, i) => (
        <LowPolyStar key={i} />
      ))}
    </group>
  );
}