<template>
  <section class="map-cell-card" aria-label="網格飾品資訊">
    <header class="map-cell-heading">
      <span class="map-cell-stamp"><img src="/images/map-field/compass.webp" alt="" width="40" height="40" draggable="false" /></span>
      <div><span class="map-cell-kicker">{{ $t('map.cell_info.decor_types') }}</span><h3>{{ count }} {{ $t('map.cell_info.types_unit') }}</h3></div>
      <span class="map-cell-status" :style="{ background: palette.soft, color: palette.ink }">{{ reported ? $t('map.cell_info.user_reported') : count === 0 ? $t('decor_types.roadside') : count === 1 ? $t('map.cell_info.pure') : $t('map.cell_info.mixed') }}</span>
    </header>
    <div class="map-cell-decors">
      <div v-for="decor in decors" :key="decor.id" class="map-cell-decor" :class="{ 'is-removed': decor.state === 'removed' }">
        <span class="map-cell-portrait" aria-hidden="true"><img :src="getMapTypeScene(decor.id).primary" alt="" width="35" height="44" loading="lazy" draggable="false" @error="portraitFallback" /></span>
        <span>{{ decor.name }}</span>
        <small v-if="decor.state === 'added'">{{ $t('map.cell_info.user_reported') }}</small>
        <small v-if="decor.state === 'removed'">{{ $t('map.report.extra') }}</small>
      </div>
    </div>
    <button v-if="communityCount" class="map-cell-community" @click="$emit('open-community')"><Icon name="lucide:map-pin" class="h-4 w-4" />{{ $t('map.community.cell_points', { n: communityCount }) }}<span aria-hidden="true">↗</span></button>
    <p class="map-cell-note">{{ $t('map.prediction_note') }}</p>
    <p v-if="reported" class="map-cell-warning"><Icon name="lucide:flag" class="h-4 w-4 shrink-0" />{{ $t('map.report.impure_warning') }}</p>
    <div v-if="canReport" class="map-cell-actions">
      <button v-if="canReportPure" @click="$emit('report-pure')">{{ $t('map.report.error_pure') }}</button>
      <div v-if="!pureMode" class="map-cell-action-pair">
        <button @click="$emit('report-missing')"><Icon name="lucide:plus" class="h-4 w-4" />{{ $t('map.report.missing') }}</button>
        <button @click="$emit('report-extra')"><Icon name="lucide:minus" class="h-4 w-4" />{{ $t('map.report.extra') }}</button>
      </div>
    </div>
    <footer><span>S2 · L17</span><span>{{ cellId }}</span></footer>
  </section>
</template>

<script setup lang="ts">
import { getGridPalette } from '~/utils/mapPalette';
import { getMapTypeScene } from '~/utils/mapTypeScenes';
const portraitFallback = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (!img.src.endsWith('/images/friends-comic/pikmin-red.png')) img.src = '/images/friends-comic/pikmin-red.png';
};
const props = defineProps<{
  cellId: string;
  count: number;
  decors: { id: string; name?: string; icon?: string; iconName?: string; state: 'base' | 'added' | 'removed' }[];
  reported: boolean;
  canReport: boolean;
  canReportPure: boolean;
  pureMode?: boolean;
  communityCount?: number;
}>();
const palette = computed(() => getGridPalette(props.count, props.reported));
defineEmits(['report-pure', 'report-missing', 'report-extra', 'open-community']);
</script>

<style scoped>
.map-cell-heading { position: relative; isolation: isolate; min-height: 70px; margin: -22px -18px 0; padding: 16px 22px 12px 18px; background: #fcf6e4 url('/images/map-field/woodland-camp.webp') center bottom / cover; border-bottom: 1px solid #d8dcc8; }
.map-cell-heading::before { content: ''; position: absolute; z-index: -1; inset: 0; background: #fffbea94; pointer-events: none; }
.map-cell-stamp { background: #fffbe4; border: 1px solid #c3cdaa; border-radius: 50%; box-shadow: 0 2px 0 #c8d0b5; transform: rotate(-12deg); }
.map-cell-stamp img { width: 34px; height: 34px; object-fit: contain; }
.map-cell-decor { min-height: 58px; padding: 5px 10px; background: #f7f5e8; box-shadow: 0 2px 0 #d6dcc7; }
.map-cell-portrait { position: relative; display: grid; place-items: center; flex-shrink: 0; width: 36px; height: 46px; border: 1px solid #d8dcc9; border-radius: 3px; background: #fffcef; transform: rotate(-4deg); box-shadow: 1px 2px 0 #ced5bd; }
.map-cell-portrait img { width: 32px; height: 42px; object-fit: contain; }
.map-cell-decor.is-removed .map-cell-portrait { opacity: 0.5; filter: grayscale(1); }
.map-cell-decors { margin-block: 12px; }
.map-cell-card p.map-cell-note { margin-block: 8px; font-size: 12px; line-height: 1.5; }
.map-cell-actions { margin-top: 8px; }
.map-cell-card footer { margin-top: 8px; padding-top: 8px; }
</style>
