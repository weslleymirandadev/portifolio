import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const GlassScrollContent = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Animação para o container de vidro
  const glassY = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
  const glassOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // Animação para o conteúdo
  const contentScale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <div ref={containerRef} className="relative h-[230dvh] w-full">
      {/* Container de vidro animado */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-[80vh] backdrop-blur-lg bg-black/20 rounded-t-3xl border-t border-l border-r border-white/30 shadow-2xl p-6 md:p-10 overflow-hidden"
        style={{
          y: glassY,
          opacity: glassOpacity
        }}
      >
        {/* Efeito de vidro adicional */}
        <div className="absolute inset-0 backdrop-blur-md bg-black/10 rounded-t-3xl" />

        {/* Conteúdo animado */}
        <motion.div
          className="h-full flex flex-col justify-center items-center text-white relative z-10"
          style={{
            scale: contentScale,
            opacity: contentOpacity
          }}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6 text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Portfólio Criativo
          </motion.h2>
          
          <motion.p
            className="text-lg md:text-xl max-w-2xl text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Explore meus trabalhos e projetos mais recentes
          </motion.p>
          
          <motion.div
            className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <motion.div
                key={item}
                className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="h-40 mb-4 bg-white/10 rounded-lg" />
                <h3 className="text-xl font-semibold mb-2">Projeto {item}</h3>
                <p className="text-white/70">Descrição breve do projeto...</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};