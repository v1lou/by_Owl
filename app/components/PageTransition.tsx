'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const BATS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  startX: `${10 + (i * 12) % 80}vw`,
  startY: `${20 + (i * 17) % 60}vh`,
  endX: i % 2 === 0 ? '-10vw' : '110vw',
  endY: `${10 + (i * 19) % 70}vh`,
  delay: 0.1 + i * 0.07,
  duration: 0.8 + (i % 3) * 0.15,
  scale: 0.4 + (i % 4) * 0.2,
}));

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const pendingRef = useRef<React.ReactNode>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    pendingRef.current = children;
    setIsTransitioning(true);
  }, [pathname]);

  const handleOverlayComplete = () => {
    if (pendingRef.current) {
      setDisplayChildren(pendingRef.current);
      pendingRef.current = null;
    }
    setIsTransitioning(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        {displayChildren}
      </motion.div>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="fog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={handleOverlayComplete}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Основной туман — тёмный центр */}
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: [0, 0.92, 0.85, 0] }}
              transition={{ duration: 0.9, times: [0, 0.25, 0.65, 1], ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(ellipse 80% 60% at 50% 50%,
                    rgba(0,0,0,0.82) 0%,
                    rgba(5,3,10,0.75) 40%,
                    rgba(0,0,0,0.4) 70%,
                    transparent 100%
                  )
                `,
              }}
            />

            {/* Боковые клубы тумана */}
            <motion.div
              initial={{ opacity: 0, x: '-8%' }}
              animate={{ opacity: [0, 0.7, 0.5, 0], x: ['−8%', '0%', '2%', '5%'] }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(ellipse 60% 80% at 0% 50%,
                    rgba(0,0,0,0.65) 0%,
                    rgba(0,0,0,0.3) 50%,
                    transparent 100%
                  )
                `,
                filter: 'blur(18px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, x: '8%' }}
              animate={{ opacity: [0, 0.7, 0.5, 0], x: ['8%', '0%', '-2%', '-5%'] }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(ellipse 60% 80% at 100% 50%,
                    rgba(0,0,0,0.65) 0%,
                    rgba(0,0,0,0.3) 50%,
                    transparent 100%
                  )
                `,
                filter: 'blur(18px)',
              }}
            />

            {/* Мелкие клочья тумана */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`wisp-${i}`}
                initial={{
                  opacity: 0,
                  x: `${15 + i * 14}vw`,
                  y: `${20 + (i * 23) % 60}vh`,
                  scale: 0.6,
                }}
                animate={{
                  opacity: [0, 0.55, 0.4, 0],
                  y: `${10 + (i * 23) % 60}vh`,
                  scale: [0.6, 1.1, 1.3, 1.5],
                }}
                transition={{
                  duration: 0.9,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: 180 + i * 40,
                  height: 120 + i * 20,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
                  filter: 'blur(22px)',
                }}
              />
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.4, 0] }}
              transition={{ duration: 1.05, times: [0, 0.2, 0.7, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(ellipse 100% 100% at 50% 50%,
                    transparent 35%,
                    rgba(0,0,0,0.55) 70%,
                    rgba(0,0,0,0.85) 100%
                  )
                `,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}