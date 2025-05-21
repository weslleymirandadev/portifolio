// components/FromShellToName.tsx
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const TARGET_TEXT = "Weslley Miranda";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const TYPING_TEXT = "whoami";
const TYPING_SPEED = 200;
const BLINK_SPEED = 300;
const CHARS = "!@#$%^&*():{};|,.<>/?";

export const FromShellToName = () => {
  const intervalRef = useRef<number | null>(null);
  const [commandText, setCommandText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [showUnderscore, setShowUnderscore] = useState(true);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isScrambleDone, setIsScrambleDone] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);

  const scramble = () => {
    let pos = 0;
    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
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
    setIsScrambleDone(true);
  };

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

    const blinkInterval = setInterval(() => {
      setShowUnderscore((prev) => !prev);
    }, BLINK_SPEED);

    return () => {
      clearInterval(typingInterval);
      clearInterval(blinkInterval);
    };
  }, []);

  useEffect(() => {
    if (isTypingDone) {
      const scrambleTimer = setTimeout(() => {
        scramble();
      }, 2000);
      return () => {
        clearTimeout(scrambleTimer);
        clearInterval(intervalRef.current || undefined);
      };
    }
  }, [isTypingDone]);

  useEffect(() => {
    const cleanup = setTimeout(() => {
      if (isScrambleDone) setIsContentVisible(false);
    }, 2500);
    return () => clearTimeout(cleanup);
  }, [isScrambleDone]);

  return (
    <motion.div
      className="flex fixed z-30 min-w-screen min-h-screen items-center justify-center bg-black overflow-hidden"
      animate={{ opacity: isScrambleDone ? 0 : 1 }}
      transition={{ duration: 0.5, delay: 2 }}
    >
      {isContentVisible && (
        <section className="min-w-[220px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-2xl text-neutral-300 flex flex-col gap-2"
          >
            <motion.div
              animate={{ opacity: isScrambleDone ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-red-700">$</span> {commandText}
              {!isTypingDone && showUnderscore && (
                <span className="animate-pulse text-red-700">_</span>
              )}
            </motion.div>

            {isTypingDone && (
              <div>
                <motion.span
                  animate={{
                    scale: isScrambleDone ? 15 : 1,
                    opacity: isScrambleDone ? 0 : 1,
                  }}
                  transition={{ duration: 0.5, delay: 2 }}
                  className="inline-block"
                >
                  {outputText}
                  {isTypingDone && showUnderscore && (
                    <span className="animate-pulse text-red-700">_</span>
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
