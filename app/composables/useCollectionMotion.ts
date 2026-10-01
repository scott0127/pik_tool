import { gsap } from 'gsap';
import type { Ref } from 'vue';
import { collectionMotion as motion, collectionMotionEnabled } from '~/utils/collectionMotion';

export function useCollectionMotion(root: Ref<HTMLElement | null>) {
  let context: gsap.Context | undefined;
  let media: gsap.MatchMedia | undefined;
  let observer: IntersectionObserver | undefined;
  interface PanelMotion {
    timeline: gsap.core.Timeline;
    done: () => void;
  }
  const panels = new Map<Element, PanelMotion>();
  const interruptedPanels = new WeakSet<Element>();
  const transientContexts = new Set<gsap.Context>();

  // Gesture and arrival contexts live only for their animation. Long visits do
  // not retain every completed search or control tween in one page context.
  const run = (animate: () => gsap.core.Tween) => {
    if (!context || !collectionMotionEnabled()) return;
    let tween: gsap.core.Tween | undefined;
    const transient = gsap.context(() => { tween = animate(); }, root.value!);
    transientContexts.add(transient);
    const release = () => {
      if (!transientContexts.delete(transient)) return;
      transient.kill();
    };
    tween?.eventCallback('onComplete', release);
    tween?.eventCallback('onInterrupt', release);
  };
  const watchChapters = () => {
    observer?.disconnect();
    root.value?.querySelectorAll<HTMLElement>('.collection-category-header').forEach(header => {
      if (!header.dataset.arrived) observer?.observe(header);
    });
  };
  const panelTargets = (element: Element) => [
    element,
    ...element.querySelectorAll('.collection-filter-sheet, .collection-filter-backdrop, .collection-sheet-tabs, .collection-filter-sheet .space-y-8 > div'),
  ];
  const resetPanel = (element: Element) => {
    interruptedPanels.delete(element);
    gsap.set(panelTargets(element), { clearProps: 'transform,opacity,height,overflow' });
  };
  const cancelPanel = (element: Element) => {
    const panel = panels.get(element);
    if (!panel) return;
    // Vue has already cancelled its previous transition callback. Keep the exact
    // visual position so the next enter/leave travels from here, without a snap.
    panels.delete(element);
    interruptedPanels.add(element);
    panel.timeline.kill();
  };
  const finishPanel = (element: Element, panel: PanelMotion) => {
    if (panels.get(element) !== panel) return;
    panels.delete(element);
    resetPanel(element);
    panel.done();
  };
  const settlePanels = () => {
    for (const [element, panel] of [...panels]) {
      panel.timeline.kill();
      finishPanel(element, panel);
    }
  };

  onMounted(() => {
    media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      context = gsap.context(() => {}, root.value!);
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const header = entry.target as HTMLElement;
          header.dataset.arrived = 'true';
          observer?.unobserve(header);
          run(() => gsap.fromTo(header, { y: 14, rotationX: -5, opacity: .7 }, {
            y: 0, rotationX: 0, opacity: 1, duration: .45,
            transformOrigin: 'center bottom', ease: 'power2.out', clearProps: 'transform,opacity',
          }));
        });
      }, { threshold: .15 });
      watchChapters();
      return () => {
        observer?.disconnect();
        observer = undefined;
        // Finish Vue's current enter/leave after clearing any partial dimensions.
        // A runtime reduced-motion change cannot strand a visible zero-height panel.
        settlePanels();
        for (const transient of [...transientContexts]) transient.revert();
        transientContexts.clear();
        context?.revert();
        context = undefined;
      };
    });
  });
  onBeforeUnmount(() => {
    media?.revert();
    settlePanels();
  });

  const enterPanel = (element: Element, done: () => void) => {
    cancelPanel(element);
    if (!context || !collectionMotionEnabled() || !element.getClientRects().length) {
      resetPanel(element);
      done();
      return;
    }
    const interrupted = interruptedPanels.has(element);
    interruptedPanels.delete(element);
    const sheet = element.querySelector('.collection-filter-sheet');
    const backdrop = element.querySelector('.collection-filter-backdrop');
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const panel: PanelMotion = { timeline, done };
    panels.set(element, panel);
    timeline.eventCallback('onComplete', () => finishPanel(element, panel));
    if (sheet && backdrop) {
      const groups = sheet.querySelectorAll('.space-y-8 > div');
      if (!interrupted) {
        gsap.set(backdrop, { opacity: 0 });
        gsap.set(sheet, { yPercent: 100, rotationX: 7 });
        gsap.set(groups, { y: 14, opacity: 0 });
      }
      timeline.to(backdrop, { opacity: 1, duration: .25 }, 0)
        .to(sheet, { yPercent: 0, rotationX: 0, duration: .48 }, 0)
        .to(groups, { y: 0, opacity: 1, duration: .3, stagger: .045 }, .14);
    } else {
      const height = element.scrollHeight;
      if (!interrupted) gsap.set(element, { height: 0, opacity: .4 });
      gsap.set(element, { overflow: 'hidden' });
      timeline.to(element, { height, opacity: 1, duration: .34 });
    }
  };
  const leavePanel = (element: Element, done: () => void) => {
    cancelPanel(element);
    if (!context || !collectionMotionEnabled() || !element.getClientRects().length) {
      resetPanel(element);
      done();
      return;
    }
    interruptedPanels.delete(element);
    const sheet = element.querySelector('.collection-filter-sheet');
    const backdrop = element.querySelector('.collection-filter-backdrop');
    const timeline = gsap.timeline({ defaults: { ease: 'power2.in', duration: .27 } });
    const panel: PanelMotion = { timeline, done };
    panels.set(element, panel);
    timeline.eventCallback('onComplete', () => finishPanel(element, panel));
    if (sheet && backdrop) {
      const groups = sheet.querySelectorAll('.space-y-8 > div');
      timeline.to(groups, { y: 7, opacity: 0, duration: .14 }, 0)
        .to(sheet, { yPercent: 100, rotationX: 5 }, .04)
        .to(backdrop, { opacity: 0, duration: .22 }, .05);
    } else {
      gsap.set(element, { height: element.getBoundingClientRect().height, overflow: 'hidden' });
      timeline.to(element, { height: 0, opacity: 0 });
    }
  };
  const refreshResults = () => {
    const results = root.value?.querySelector('.collection-results');
    if (!results) return;
    run(() => gsap.fromTo(results, { y: 12, rotationX: -1.5, opacity: .65 }, {
      y: 0, rotationX: 0, opacity: 1, duration: .32, transformOrigin: 'center top',
      ease: motion.ease, overwrite: true, clearProps: 'transform,opacity',
    }));
    watchChapters();
  };
  const respondToControl = (event: MouseEvent) => {
    const target = (event.target as Element).closest<HTMLElement>('.category-tag, .filter-chip, .pikmin-filter-btn');
    if (!target) return;
    run(() => gsap.fromTo(target, { y: 2, scale: .97 }, {
      y: 0, scale: 1, duration: .24, ease: motion.spring, overwrite: true, clearProps: 'transform',
    }));
  };
  const revealCategory = (category: HTMLElement) => {
    const content = category.querySelector('.collection-category-content-inner');
    if (!content) return;
    run(() => gsap.fromTo(content, { y: -12, opacity: .5 }, {
      y: 0, opacity: 1, duration: .34, ease: motion.ease, overwrite: true, clearProps: 'transform,opacity',
    }));
  };
  return { enterPanel, leavePanel, cancelPanel, refreshResults, respondToControl, revealCategory };
}
