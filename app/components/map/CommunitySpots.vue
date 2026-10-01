<template>
  <Transition name="community-sheet">
    <div v-if="modelValue" class="community-overlay" @click.self="close" @keydown.esc="close">
      <section class="community-card" role="dialog" aria-modal="true" :aria-label="$t('map.community.title')">
        <header><div><p>{{ $t('map.community.eyebrow') }}</p><h2>{{ $t('map.community.title') }}</h2></div><button ref="closeButton" @click="close" :aria-label="$t('map.panel.close')"><Icon name="lucide:x" class="h-5 w-5" /></button></header>
        <details class="community-note"><summary>{{ $t('map.community.about_data') }}</summary><p>{{ $t('map.community.note') }}</p></details>
        <div class="community-filters"><label>{{ $t('map.community.region') }}<select v-model="city"><option value="">{{ $t('map.community.all') }}</option><option v-for="region in cities" :key="region">{{ region }}</option></select></label><label>{{ $t('map.community.decor') }}<select v-model="decor"><option value="">{{ $t('map.community.all') }}</option><option v-for="id in decorIds" :key="id" :value="id">{{ $t('decor_types.' + id) }}</option></select></label><label class="community-mixed"><input type="checkbox" v-model="includeMixed" />{{ $t('map.community.include_mixed') }}</label></div>
        <label class="community-search"><span>{{ $t('map.community.search') }}</span><input v-model="query" type="search" :aria-label="$t('map.community.search')" :placeholder="$t('map.community.search_placeholder')" /></label>
        <div ref="list" class="community-list">
          <article v-for="spot in visibleSpots" :key="spot.id">
            <div class="community-spot-top"><span>{{ spot.city }}</span><span :class="{ 'is-mixed': spot.status === 'mixed' }">{{ $t('map.community.status.' + spot.status) }}</span></div>
            <h3>{{ spot.name }}</h3>
            <div class="community-decor-types"><span v-for="id in spot.decorIds" :key="id">{{ $t('decor_types.' + id) }}</span></div>
            <p>{{ spot.standingHint }}</p>
            <p v-if="spot.caution" class="community-caution">{{ spot.caution }}</p>
            <button v-if="mappableIds.has(spot.id)" class="community-locate" @click="emit('locate', spot)">{{ $t('map.community.locate_here') }}<span aria-hidden="true">↗</span></button>
            <footer><span v-if="spot.sourceDate">{{ $t('map.community.source_date') }} {{ spot.sourceDate }}</span><span v-if="spot.confirmationDate">{{ $t('map.community.confirmation_date') }} {{ spot.confirmationDate }}</span><span v-if="spot.sourceId">{{ sourceAuthor(spot.sourceId) }}</span><a :href="spot.sourceUrl" target="_blank" rel="noopener noreferrer">{{ $t('map.community.source') }} ↗</a><a :href="mapSearchUrl(spot)" target="_blank" rel="noopener noreferrer">{{ $t(spot.lat != null ? 'map.community.locate' : 'map.community.nearby') }} ↗</a></footer>
          </article>
          <p v-if="filteredSpots.length === 0">{{ $t('map.community.empty') }}</p>
        </div>
        <div class="community-footer"><span>{{ filteredSpots.length }} {{ $t('map.stats.places') }} · {{ page }} / {{ pageCount }}</span><nav :aria-label="$t('map.community.pages')"><button :disabled="page === 1" @click="page--">{{ $t('map.community.previous') }}</button><button :disabled="page === pageCount" @click="page++">{{ $t('map.community.next') }}</button></nav></div>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { communitySpots as spots, communityPureSpots, communitySourceAuthor as sourceAuthor, type CommunitySpot } from '~/utils/communitySpots';
const mappableIds = new Set(communityPureSpots.map(spot => spot.id));
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; locate: [spot: CommunitySpot] }>();
const close = () => emit('update:modelValue', false);
const city = ref('');
const includeMixed = ref(false);
const decor = ref('');
const query = ref('');
const page = ref(1);
const pageSize = 30;
const list = ref<HTMLElement | null>(null);
const cities = [...new Set(spots.map(spot => spot.city))];
const decorIds = [...new Set(spots.flatMap(spot => spot.decorIds))];
const filteredSpots = computed(() => {
  const search = query.value.trim().toLocaleLowerCase();
  return spots.filter(spot => (!city.value || spot.city === city.value)
    && (!decor.value || spot.decorIds.includes(decor.value))
    && (includeMixed.value || spot.status !== 'mixed')
    && (!search || `${spot.name} ${spot.standingHint} ${spot.caution} ${spot.city}`.toLocaleLowerCase().includes(search)));
});
const pageCount = computed(() => Math.max(1, Math.ceil(filteredSpots.value.length / pageSize)));
const visibleSpots = computed(() => filteredSpots.value.slice((page.value - 1) * pageSize, page.value * pageSize));
watch([city, decor, query, includeMixed], () => { page.value = 1; list.value?.scrollTo({ top: 0 }); });
watch(page, () => list.value?.scrollTo({ top: 0 }));
const mapSearchUrl = (spot: CommunitySpot) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.lat != null && spot.lng != null ? `${spot.lat},${spot.lng}` : spot.city + ' ' + spot.searchQuery)}`;
const closeButton = ref<HTMLButtonElement | null>(null);
let previousFocus: HTMLElement | null = null;
watch(() => props.modelValue, async open => {
  if (open) { previousFocus = document.activeElement as HTMLElement; await nextTick(); closeButton.value?.focus({ preventScroll: true }); }
  else previousFocus?.focus({ preventScroll: true });
});
</script>

<style scoped>
.community-locate { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 44px; margin-top: 12px; padding: 10px 12px; border-radius: 8px; background: #10b981; color: white; font-size: 13px; font-weight: 700; text-align: left; }
.community-locate:hover { background: #059669; }
.community-locate:focus-visible { outline: 2px solid #047857; outline-offset: 3px; }
.community-overlay { position: absolute; inset: 0; z-index: 2001; display: grid; place-items: center; background: #20332675; backdrop-filter: blur(4px); padding: 20px; }
.community-card { width: min(100%, 560px); max-height: 88%; display: flex; flex-direction: column; background: #faf9f1; border: 1px solid #d6dccb; border-radius: 20px; box-shadow: 0 4px 0 #c8d0ba, 0 24px 60px #20332635; color: #304f3a; overflow: hidden; }
header { display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 12px; }
header p { font-size: 12px; color: #67755f; margin-bottom: 4px; }
h2 { font-size: 21px; font-weight: 800; }
header button { width: 44px; height: 44px; border-radius: 50%; background: #e8eedb; display: grid; place-items: center; flex-shrink: 0; }
.community-note { padding: 0 20px 15px; color: #67755f; font-size: 13px; line-height: 1.7; }
.community-note summary { cursor: pointer; padding: 8px 0; font-weight: 700; }
.community-note p { padding-top: 5px; }
.community-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 0 20px 8px; font-size: 13px; }
.community-filters select { max-width: 170px; min-width: 0; }
.community-search { padding: 0 20px 12px; display: grid; gap: 6px; font-size: 12px; border-bottom: 1px solid #d6dccb; }
.community-search input { width: 100%; height: 44px; padding: 10px 12px; border: 1px solid #d6dccb; border-radius: 8px; background: white; font: inherit; font-size: 16px; }
.community-filters label { display: flex; align-items: center; gap: 8px; }
select { border: 1px solid #d6dccb; background: #f0f2e6; border-radius: 8px; min-height: 44px; padding: 8px; font: inherit; }
.community-mixed { min-height: 44px; cursor: pointer; }
input { accent-color: var(--map-accent); width: 17px; height: 17px; }
.community-list { overflow-y: auto; overscroll-behavior: contain; min-height: 0; padding: 16px 20px; display: grid; gap: 12px; }
article { border: 1px solid #d6dccb; border-radius: 12px; background: #f5f5ec; padding: 15px; }
.community-spot-top { display: flex; justify-content: space-between; gap: 8px; color: #67755f; font-size: 12px; }
.community-spot-top .is-mixed { color: #85652d; }
h3 { margin: 10px 0; font-size: 17px; font-weight: 800; line-height: 1.5; }
.community-decor-types { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.community-decor-types span { border-radius: 5px; background: #e8eedb; padding: 4px 8px; font-size: 12px; }
article p { font-size: 14px; line-height: 1.7; }
article .community-caution { color: #85652d; margin-top: 8px; font-size: 13px; }
footer { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; padding-top: 6px; border-top: 1px solid #d6dccb; font-size: 12px; color: #67755f; }
footer > span { width: 100%; }
footer a { min-height: 44px; display: flex; align-items: center; padding: 0 8px; font-weight: 700; color: #304f3a; }
.community-footer { border-top: 1px solid #d6dccb; font-size: 12px; color: #67755f; padding: 8px 20px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-shrink: 0; }
.community-footer nav { display: flex; gap: 6px; }
.community-footer button { min-height: 44px; padding: 0 12px; border-radius: 8px; background: #10b981; color: white; font-weight: 700; }
.community-footer button:disabled { opacity: .4; }
.community-filters, .community-search, header, .community-note { flex-shrink: 0; }
.community-sheet-enter-active, .community-sheet-leave-active { transition: opacity 200ms; }
.community-sheet-enter-active .community-card, .community-sheet-leave-active .community-card { transition: transform 300ms cubic-bezier(.2,.8,.2,1); }
.community-sheet-enter-from, .community-sheet-leave-to { opacity: 0; }
.community-sheet-enter-from .community-card, .community-sheet-leave-to .community-card { transform: translateY(30px); }
@media (max-width: 767px) {
  .community-overlay { padding: 0; align-items: end; }
  .community-card { width: 100%; max-height: 92%; border-radius: 24px 24px 0 0; padding-bottom: env(safe-area-inset-bottom); }
  header { padding: 16px 20px 6px; }
  .community-note { padding-bottom: 6px; }
  .community-filters { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 4px 10px; }
  .community-filters label { display: grid; gap: 4px; }
  .community-filters select { max-width: none; width: 100%; }
  .community-filters .community-mixed { display: flex; grid-column: 1 / -1; }
  .community-search > span { display: none; }
}
</style>
