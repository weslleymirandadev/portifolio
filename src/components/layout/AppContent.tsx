import { motion, useScroll } from "framer-motion";
import { AnimatedStarWithText } from "../3D/AnimatedStarWithText";
import { BlackHole } from "../3D/BlackHole";
import { MotionBox } from "./MotionBox";
import { FromShellToName } from "./sections/whoami/FromShellToName";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const AppContent: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [show3D, setShow3D] = useState(true);
  const [_, setShowContent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [starAnimation, setStarAnimation] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"],
  });

  const [fontSize, setFontSize] = useState(30); // Initial font size

  useEffect(() => {
    THREE.Cache.enabled = true;

    const handleLoad = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.style.overflow = "hidden";
    };
    handleLoad();
    window.addEventListener("load", handleLoad);

    const timer = setTimeout(() => {
      setIsVisible(true);
      document.body.style.overflow = "visible";
    }, 8000);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollableHeight = windowHeight * 5;
      const progress = Math.min(scrollY / scrollableHeight, 1);
      setScrollProgress(progress);
    }, 16);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWidthChange = (width: string | number) => {
    const numericValue = parseFloat(width.toString());
    const unit = width.toString().replace(numericValue.toString(), "");
    if (unit === "vw" && numericValue >= 100) {
      setShow3D(false);
      setShowContent(true);
      setStarAnimation(true);
      document.body.style.backgroundColor = "#fff";
    } else {
      setShow3D(true);
      setShowContent(false);
      setStarAnimation(false);
      document.body.style.backgroundColor = "#320809";
    }
  };

  // Adjust font size dynamically to fit viewport width with a maximum limit
  useEffect(() => {
    const adjustFontSize = () => {
      if (textRef.current) {
        const viewportWidth = window.innerWidth;
        let newFontSize = 100; // Start with a large font size
        textRef.current.style.fontSize = `${newFontSize}px`;

        // Reduce font size until text fits within viewport
        while (
          textRef.current.scrollWidth > viewportWidth &&
          newFontSize > 10
        ) {
          newFontSize -= 1;
          textRef.current.style.fontSize = `${newFontSize}px`;
        }

        // Apply maximum font size limit (e.g., 60px)
        const maxFontSize = 60;
        if (newFontSize > maxFontSize) {
          newFontSize = maxFontSize;
        }

        // Set the final font size
        setFontSize(newFontSize);
      }
    };

    adjustFontSize();
    window.addEventListener("resize", adjustFontSize);
    return () => window.removeEventListener("resize", adjustFontSize);
  }, []);

  return (
    <main className="w-full">
      <FromShellToName />
      {show3D && (
        <div className="fixed top-0 left-0 w-full h-screen z-0">
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h2
              ref={textRef}
              style={{
                fontSize: `${fontSize}px`,
                whiteSpace: "nowrap",
                letterSpacing: "0.1em",
              }}
              className="font-times text-black/50 font-bold tracking-widest glowing-text"
            >
              UM UNIVERSO DE POSSIBILIDADES
            </h2>
            <motion.p
              initial={{ opacity: 1 }}
              animate={{ opacity: isVisible ? 0 : 1 }}
              transition={{ duration: 5 }}
              className="text-white text-md font-bold tracking-wider"
            >
              Role para baixo
            </motion.p>
          </div>
          <BlackHole glitchActive={false} scrollProgress={scrollProgress} />
        </div>
      )}
      <section className="fixed flex justify-between align-middle top-0 left-0 h-full w-full z-30 pointer-events-none">
        <AnimatedStarWithText
          isVisible={isVisible}
          starAnimation={starAnimation}
          scrollProgress={scrollProgress}
        />
      </section>
      <div ref={scrollRef} className="relative h-[500vh] w-full">
        <MotionBox
          isVisible={isVisible}
          scrollYProgress={scrollYProgress}
          onWidthChange={handleWidthChange}
        />
      </div>
    </main>
  );
};
