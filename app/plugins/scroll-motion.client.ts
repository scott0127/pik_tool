import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger);
  // Skip small touch-only height changes caused by the browser address bar.
  ScrollTrigger.config({ ignoreMobileResize: true });
});
