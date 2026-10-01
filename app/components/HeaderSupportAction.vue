<template>
  <component :is="kind === 'star' ? 'a' : 'button'" ref="root" class="support-action" :class="['support-' + kind, { 'is-compact': compact }]" :href="kind === 'star' ? 'https://github.com/scott0127/pik_tool' : undefined" :target="kind === 'star' ? '_blank' : undefined" :rel="kind === 'star' ? 'noopener noreferrer' : undefined" :type="kind !== 'star' ? 'button' : undefined" :title="title" :aria-label="title" @click="$emit('activate')" @pointerenter="preview" @pointerleave="reset" @pointerdown="press" @pointerup="reset" @pointercancel="reset" @focus="focus" @blur="reset" @keydown="keyPress" @keyup="keyRelease">
    <SupportActionArt ref="art" :kind="kind" :compact="compact" :order="order" />
    <span class="support-copy"><strong>{{ title }}</strong><small>{{ hint }}</small></span>
    <span class="support-arrow" aria-hidden="true">{{ kind === 'star' ? '↗' : '→' }}</span>
  </component>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
const props = defineProps<{ kind: 'coffee' | 'star' | 'feedback'; compact?: boolean }>();
defineEmits<{ activate: [] }>();
const { t } = useI18n();
const title = computed(() => t(props.kind === 'coffee' ? 'header.coffee_mobile' : 'header.support_' + props.kind));
const hint = computed(() => t('header.' + props.kind + '_hint'));
const order = ['coffee', 'star', 'feedback'].indexOf(props.kind);
const root = ref<HTMLElement | null>(null);
const art = ref<{ replay: () => void; press: () => void; reset: () => void } | null>(null);
let context: gsap.Context | undefined;
let entry: gsap.core.Tween | undefined;
let media: MediaQueryList | undefined;
let isPressed = false;
const pose = (y: number, arrowX = 0) => {
  if (media?.matches) return;
  context?.add(() => {
    gsap.to(root.value, { y, duration: .2, ease: 'power2.out', overwrite: 'auto' });
    gsap.to('.support-arrow', { x: arrowX, y: props.kind === 'star' ? -arrowX : 0, duration: .25, overwrite: true });
  });
};
const preview = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') { pose(-2, 2); art.value?.replay(); }
};
const focus = () => { if (!isPressed) { pose(-2, 2); art.value?.replay(); } };
const press = () => { isPressed = true; pose(2); art.value?.press(); };
const reset = () => { isPressed = false; pose(0); art.value?.reset(); };
const keyPress = (event: KeyboardEvent) => { if (event.key === 'Enter' || (event.key === ' ' && props.kind !== 'star')) press(); };
const keyRelease = (event: KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') reset(); };
const preferenceChanged = () => {
  if (media?.matches) {
    entry?.progress(1).kill();
    const nodes = [root.value!, root.value!.querySelector('.support-arrow')!];
    gsap.killTweensOf(nodes);
    gsap.set(nodes, { clearProps: 'transform,opacity' });
  }
};
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', preferenceChanged);
  context = gsap.context(() => {}, root.value!);
  if (!props.compact && !media.matches) context.add(() => {
    entry = gsap.fromTo(root.value, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .38, delay: order * .07, ease: 'power3.out', clearProps: 'transform,opacity' });
  });
});
onBeforeUnmount(() => { media?.removeEventListener('change', preferenceChanged); entry?.kill(); context?.revert(); });
</script>

<style scoped>
.support-action { --support-face: #f7d6c1; --support-light: #ffecdd; --support-edge: #d4a88c; --support-ink: #744a36; --support-muted: #815d48; position: relative; display: flex; align-items: center; gap: 12px; width: 100%; min-height: 86px; padding: 13px 16px; border: 1px solid #ffffffb0; border-radius: 22px; background: linear-gradient(115deg, var(--support-light), var(--support-face)); color: var(--support-ink); box-shadow: 0 3px 0 var(--support-edge), 0 8px 16px #7155480d, inset 0 1px 0 #fff9; text-align: left; text-decoration: none; -webkit-tap-highlight-color: transparent; cursor: pointer; }
.support-star { --support-face: #d7e5fa; --support-light: #edf3ff; --support-edge: #a6b9d6; --support-ink: #405676; --support-muted: #586c89; }
.support-feedback { --support-face: #e7ddf5; --support-light: #f5effc; --support-edge: #c4acd9; --support-ink: #674c7d; --support-muted: #79618d; }
.support-copy { display: grid; gap: 3px; min-width: 0; flex: 1; }
.support-copy strong { font-size: 16px; font-weight: 800; line-height: 1.5; letter-spacing: .02em; }
.support-copy small { font-size: 11px; color: var(--support-muted); line-height: 1.5; letter-spacing: .015em; }
.support-arrow { display: grid; place-items: center; width: 28px; height: 28px; border: 1px solid #fff9; border-radius: 50%; background: #ffffff60; box-shadow: 0 1px 0 var(--support-edge); font-size: 17px; flex-shrink: 0; }
.support-action:focus-visible { outline: 2px solid var(--support-ink); outline-offset: 4px; }
.is-compact { display: none; }
@media (min-width: 768px) {
  .is-compact { display: flex; width: auto; min-height: 42px; padding: 7px 9px; border-radius: 13px; gap: 8px; box-shadow: 0 2px 0 var(--support-edge), inset 0 1px 0 #fff9; }
  .is-compact .support-copy, .is-compact .support-arrow { display: none; }
}
@media (min-width: 1440px) { .is-compact .support-copy { display: block; } .is-compact .support-copy strong { font-size: 12px; letter-spacing: 0; } .is-compact .support-copy small { display: none; } }
@media (max-width: 350px) { .support-action { padding: 12px; gap: 10px; } .support-copy strong { font-size: 14px; } .support-copy small { font-size: 10px; } .support-arrow { width: 24px; height: 24px; } }
</style>
