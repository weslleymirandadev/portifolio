import { useState, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { BlackHole } from "./components/universe/BlackHole";
import { FromShellToName } from "./components/whoami/FromShellToName";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import ShootingStarsCanvas from "./components/3D/ShootingStarsCanvas";

function AppContent() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [show3D, setShow3D] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const boxWidth = useMotionValue<string | number>("16rem");
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleLoad = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.style.overflow = "hidden";
    };
    handleLoad();
    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const unsubscribe = boxWidth.on("change", (latest: string | number) => {
      const numericValue = parseFloat(latest.toString());
      const unit = latest.toString().replace(numericValue.toString(), "");
      if (unit === "vw" && numericValue >= 100) {
        setShow3D(false);
        setShowContent(true);
        window.document.body.style.backgroundColor = "#fff";
      } else if (unit === "vw" && numericValue < 100) {
        setShow3D(true);
        setShowContent(false);
      }
    });
    return () => unsubscribe();
  }, [boxWidth]);

  const contentY = useTransform(scrollYProgress, [0.5, 0.6], ["100vh", "0vh"]);
  const scale = useTransform(scrollYProgress, [0.25, 0.5], [0, 1]);
  const rotate = useTransform(scrollYProgress, [0.25, 0.5], [-180, 0]);
  const yPosition = useTransform(
    scrollYProgress,
    [0.25, 0.5, 1],
    ["100vh", "0vh", "0vh"]
  );
  const text = useTransform(scrollYProgress, [0.25, 0.5], [20, 30]);
  const width = useTransform(
    scrollYProgress,
    [0.25, 0.5, 1],
    ["16rem", "100vw", "100vw"]
  );

  useEffect(() => {
    const unsubscribe = width.on("change", (latest: string | number) => {
      boxWidth.set(latest);
    });
    return () => unsubscribe();
  }, [width, boxWidth]);

  const height = useTransform(scrollYProgress, (progress: number) => {
    if (progress < 0.25) return "16rem";
    if (progress <= 0.5) {
      return `${16 + (100 - 16) * ((progress - 0.25) / 0.25)}vh`;
    }
    const normalized = (progress - 0.5) / 0.5;
    return `${10 + (100 - 10) * Math.pow(1 - normalized, 1.5)}vh`;
  });

  const borderRadius = useTransform(
    scrollYProgress,
    [0.25, 0.5],
    ["50%", "0%"]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      window.document.body.style.overflow = "visible";
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollableHeight = windowHeight * 5;
      const progress = Math.min(scrollY / scrollableHeight, 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-w-screen">
      <FromShellToName />

      {show3D && (
        <div className="fixed top-0 left-0 min-w-screen h-screen z-0">
          <div className="absolute min-w-screen text-center top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10">
            <h2
              style={{ fontSize: `${text.get()}px` }}
              className={`font-times text-red-900 font-bold tracking-widest glowing-text`}
            >
              UM UNIVERSO DE POSSIBILIDADES
            </h2>
            <motion.p
              initial={{ opacity: 1 }}
              animate={isVisible ? { opacity: 0 } : {}}
              transition={{ duration: 5 }}
              className="text-white text-md font-bold tracking-wider"
            >
              Role para baixo
            </motion.p>
          </div>
          <BlackHole glitchActive={false} scrollProgress={scrollProgress} />
        </div>
      )}

      <div ref={scrollRef} className="relative h-[500vh] w-full">
        <motion.div
          className="fixed left-1/2 flex items-center justify-center origin-center z-10"
          style={{
            scale,
            rotate,
            borderRadius,
            width,
            height,
            x: "-50%",
            y: yPosition,
            backgroundColor: "black",
          }}
        />
      </div>

      <motion.div
        className="relative z-20 flex w-full border-2 border-green-400/20 backdrop-blur-md bg-green-400/10 rounded-2xl p-8 shadow-lg"
        style={{
          y: contentY,
          display: showContent ? "block" : "none",
        }}
      >
        <div className="container mx-auto py-20 flex flex-col items-center">
          <h1 className="text-4xl font-bold">Meu Conteúdo Principal</h1>
          <div className="w-full h-[50vh] mt-10">
            <ShootingStarsCanvas />
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
