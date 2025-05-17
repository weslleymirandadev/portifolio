import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const TARGET_TEXT = "Weslley Miranda";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const TYPING_TEXT = "whoami";
const TYPING_SPEED = 200; // Velocidade de digitação (ms por caractere)
const BLINK_SPEED = 300; // Velocidade do piscar do underscore (ms)

const CHARS = "!@#$%^&*():{};|,.<>/?";

export const FromShellToName = () => {
  const intervalRef = useRef<number | null>(null);
  const [commandText, setCommandText] = useState(""); // Texto da linha de comando (whoami)
  const [outputText, setOutputText] = useState(""); // Texto de saída (Weslley Miranda)
  const [showUnderscore, setShowUnderscore] = useState(true);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isScrambleDone, setIsScrambleDone] = useState(false);
  const [isWhoamiTransparent, setIsWhoamiTransparent] = useState(false); // Controla transparência do whoami
  const [isContentVisible, setIsContentVisible] = useState(true); // Controla a renderização do conteúdo

  // Função para o efeito de scramble
  const scramble = () => {
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          const randomChar = CHARS[randomCharIndex];

          return randomChar;
        })
        .join("");

      setOutputText(scrambled);
      pos++;

      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current || undefined);
    setOutputText(TARGET_TEXT);
    setIsScrambleDone(true); // Marca o scramble como concluído
  };

  // Efeito de digitação para "whoami"
  useEffect(() => {
    let typingIndex = 0;

    const typingInterval = setInterval(() => {
      if (typingIndex < TYPING_TEXT.length) {
        setCommandText(TYPING_TEXT.slice(0, typingIndex + 1));
        typingIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingDone(true);
      }
    }, TYPING_SPEED);

    // Piscar do underscore
    const blinkInterval = setInterval(() => {
      setShowUnderscore((prev) => !prev);
    }, BLINK_SPEED);

    return () => {
      clearInterval(typingInterval);
      clearInterval(blinkInterval);
    };
  }, []);

  // Iniciar o scramble 2 segundos após o término da digitação
  useEffect(() => {
    if (isTypingDone) {
      const scrambleTimer = setTimeout(() => {
        setCommandText(TYPING_TEXT); // Garante que "whoami" fique fixo
        setOutputText(""); // Inicia a linha de saída
        scramble(); // Inicia o scramble para "Weslley Miranda"
      }, 2000);

      return () => {
        clearTimeout(scrambleTimer);
        clearInterval(intervalRef.current || undefined);
      };
    }
  }, [isTypingDone]);

  // Iniciar a transparência do "whoami" após o scramble
  useEffect(() => {
    if (isScrambleDone) {
      const whoamiFadeTimer = setTimeout(() => {
        setIsWhoamiTransparent(true); // Marca a primeira linha como transparente
      }, 500); // 0.5s para a transparência do whoami

      return () => {
        clearTimeout(whoamiFadeTimer);
      };
    }
  }, [isScrambleDone]);

  // Iniciar a animação de zoom, transparência do fundo e remoção após 2s da transparência do whoami
  useEffect(() => {
    if (isWhoamiTransparent) {
      const removeTimer = setTimeout(() => {
        setIsContentVisible(false); // Remove o conteúdo do DOM
      }, 2500); // 2s de pausa + 0.5s para zoom e transparência

      return () => {
        clearTimeout(removeTimer);
      };
    }
  }, [isWhoamiTransparent]);

  return (
    <motion.div
      className="flex fixed z-10 min-w-screen min-h-screen items-center justify-center bg-black overflow-hidden"
      animate={{ opacity: isWhoamiTransparent ? 0 : 1 }}
      transition={{ duration: 0.5, delay: 2 }} // Fundo fica transparente em 0.5s após 2s do whoami
    >
      {isContentVisible && (
        <section className="min-w-[220px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-2xl text-neutral-300 flex flex-col gap-2"
          >
            {/* Linha do comando "whoami" */}
            <motion.div
              animate={{ opacity: isScrambleDone ? 0 : 1 }}
              transition={{ duration: 0.5 }} // "$ whoami" fica transparente em 0.5s
            >
              <span className="text-green-700">$</span> {commandText}
              {!isTypingDone && showUnderscore && (
                <span className="animate-pulse">_</span>
              )}
            </motion.div>
            {/* Linha da saída "Weslley Miranda" */}
            {isTypingDone && (
              <div>
                <motion.span
                  animate={{
                    scale: isWhoamiTransparent ? 15 : 1, // Zoom para 15x
                    opacity: isWhoamiTransparent ? 0 : 1, // Fica transparente com o fundo
                  }}
                  transition={{ duration: 0.5, delay: 2 }} // Zoom e transparência em 0.5s após 2s
                  className="inline-block"
                >
                  {outputText}
                  {isTypingDone && showUnderscore && (
                    <span className="animate-pulse">_</span>
                  )}
                </motion.span>
              </div>
            )}
          </motion.div>
        </section>
      )}
    </motion.div>
  );
};