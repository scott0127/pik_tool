import { gsap } from 'gsap';
import type { Ref } from 'vue';
import { collectionMotion as motion, collectionMotionEnabled } from '~/utils/collectionMotion';

export function useCollectionMotion(root: Ref<HTMLElement | null>) {
  let context: gsap.Context | undefined;

  const run = (animate: () => void) => {
    if (context && collectionMotionEnabled()) context.add(animate);
  };

  onMounted(() => {
    context = gsap.context(() => {}, root.value!);
    run(() => {
      gsap.fromTo(root.value!.querySelectorAll('.collection-page-header, .collection-filter-panel'),
        { y: 8, opacity: 0.6 },
        { y: 0, opacity: 1, duration: motion.settle, stagger: 0.05, ease: motion.ease, clearProps: 'transform,opacity' });
    });
  });

  onBeforeUnmount(() => {
    context?.revert();
    context = undefined;
  });

  // Vue calls these hooks for both the desktop panel and the teleported mobile sheet.
  const enterPanel = (element: Element, done: () => void) => {
    if (!context || !collectionMotionEnabled() || !element.getClientRects().length) return done();
    const sheet = element.querySelector('.collection-filter-sheet');
    const backdrop = element.querySelector('.collection-filter-backdrop');
    run(() => {
      const timeline = gsap.timeline({ onComplete: done, defaults: { ease: motion.ease } });
      if (sheet && backdrop) {
        timeline.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: motion.exit }, 0)
          .fromTo(sheet, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: motion.enter, clearProps: 'transform,opacity' }, 0);
      } else {
        timeline.fromTo(element, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: motion.enter, clearProps: 'transform,opacity' });
      }
    });
  };

  const leavePanel = (element: Element, done: () => void) => {
    if (!context || !collectionMotionEnabled() || !element.getClientRects().length) return done();
    const sheet = element.querySelector('.collection-filter-sheet');
    const backdrop = element.querySelector('.collection-filter-backdrop');
    run(() => {
      const timeline = gsap.timeline({ onComplete: done, defaults: { duration: motion.exit, ease: 'power2.in', overwrite: true } });
      if (sheet && backdrop) {
        timeline.to(sheet, { y: 20, opacity: 0 }, 0).to(backdrop, { opacity: 0 }, 0);
      } else {
        timeline.to(element, { y: -4, opacity: 0 });
      }
    });
  };

  const cancelPanel = (element: Element) => {
    const targets = [element, ...element.querySelectorAll('.collection-filter-sheet, .collection-filter-backdrop')];
    gsap.killTweensOf(targets);
    gsap.set(targets, { clearProps: 'transform,opacity' });
  };

  const refreshResults = () => {
    const results = root.value?.querySelector('.collection-results');
    if (!results) return;
    // Animate one results surface, never a tween for every item in the catalog.
    run(() => {
      gsap.fromTo(results, { y: 6, opacity: 0.72 }, {
        y: 0, opacity: 1, duration: motion.enter, ease: motion.ease,
        overwrite: true, clearProps: 'transform,opacity',
      });
    });
  };

  const respondToControl = (event: MouseEvent) => {
    const target = (event.target as Element).closest<HTMLElement>('.category-tag, .filter-chip, .pikmin-filter-btn');
    if (!target) return;
    run(() => {
      gsap.fromTo(target, { scale: 0.96 }, {
        scale: 1, duration: motion.enter, ease: motion.spring,
        overwrite: true, clearProps: 'transform',
      });
    });
  };

  const revealCategory = (category: HTMLElement) => {
    const content = category.querySelector('.collection-category-content-inner');
    if (!content) return;
    run(() => {
      gsap.fromTo(content, { y: -6, opacity: 0.6 }, {
        y: 0, opacity: 1, duration: motion.enter, ease: motion.ease,
        overwrite: true, clearProps: 'transform,opacity',
      });
    });
  };

  return { enterPanel, leavePanel, cancelPanel, refreshResults, respondToControl, revealCategory };
}
