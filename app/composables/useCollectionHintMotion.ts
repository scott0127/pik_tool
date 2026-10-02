import { gsap } from 'gsap';
import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';

/** Two brief hints per mount; never keep decorative animation running off screen. */
export function useCollectionHintMotion(
  element: Ref<HTMLElement | null>,
  active: () => boolean,
  build: () => gsap.core.Timeline,
) {
  let context: gsap.Context | undefined;
  let motion: gsap.core.Timeline | undefined;
  let observer: IntersectionObserver | undefined;
  let media: MediaQueryList | undefined;
  let visible = false;
  let started = false;
  let mounted = false;

  const clear = () => {
    context?.revert();
    context = undefined;
    motion = undefined;
  };

  const sync = () => {
    if (!mounted) return;
    if (!active() || media?.matches) {
      clear();
      return;
    }
    if (!visible || document.hidden) {
      motion?.pause();
      return;
    }
    if (motion) {
      motion.play();
    } else if (!started && element.value) {
      started = true;
      context = gsap.context(() => {
        motion = gsap.timeline({ paused: true, repeat: 1, repeatDelay: 6 });
        motion.add(build()).play();
      }, element.value);
    }
  };

  watch(active, sync);
  onMounted(() => {
    mounted = true;
    media = window.matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      sync();
    }, { threshold: 0.2 });
    if (element.value) observer.observe(element.value);
  });

  onBeforeUnmount(() => {
    mounted = false;
    observer?.disconnect();
    media?.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    clear();
  });
}
