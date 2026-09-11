// One rhythm for the collection's controls, panels, and collectible cards.
export const collectionMotion = {
  press: 0.12,
  enter: 0.28,
  settle: 0.36,
  exit: 0.18,
  ease: 'power2.out',
  spring: 'back.out(1.25)',
} as const;

export const collectionMotionStyle = {
  '--collection-motion-fast': `${collectionMotion.exit}s`,
  '--collection-motion-enter': `${collectionMotion.enter}s`,
  '--collection-motion-settle': `${collectionMotion.settle}s`,
  '--collection-motion-ease': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
};

export const collectionMotionEnabled = () =>
  typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
