<template>
  <section class="community-map-card" :aria-label="$t('map.community.map_point')">
    <header><span class="community-map-status">{{ $t('map.community.status.reported_pure') }}</span><h3>{{ $t('decor_types.' + spot.decorIds[0]) }}</h3><span class="community-map-region">{{ spot.city }}</span></header>
    <p class="community-map-hint">{{ spot.standingHint }}</p>
    <details v-if="spot.caution"><summary>{{ $t('map.community.original_hint') }}</summary><p>{{ spot.caution }}</p></details>
    <dl><div v-if="spot.confirmationDate"><dt>{{ $t('map.community.confirmation_date') }}</dt><dd>{{ spot.confirmationDate }}</dd></div><div v-if="spot.sourceDate"><dt>{{ $t('map.community.source_date') }}</dt><dd>{{ spot.sourceDate }}</dd></div><div><dt>{{ $t('map.community.contributor') }}</dt><dd>{{ communitySourceAuthor(spot.sourceId) }}</dd></div></dl>
    <p class="community-map-disclaimer">{{ $t('map.community.cell_note') }}</p>
    <a class="community-map-source" :href="spot.sourceUrl" target="_blank" rel="noopener noreferrer">{{ $t('map.community.source') }}<span aria-hidden="true">↗</span></a>
    <footer>{{ spot.lat.toFixed(6) }}, {{ spot.lng.toFixed(6) }}</footer>
  </section>
</template>

<script setup lang="ts">
import { communitySourceAuthor, type LocatedCommunitySpot } from '~/utils/communitySpots';
defineProps<{ spot: LocatedCommunitySpot }>();
</script>

<style scoped>
.community-map-card { padding: 20px 18px 14px; color: var(--map-ink); }
header { padding-right: 22px; display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 8px; }
.community-map-status { grid-column: 1 / -1; justify-self: start; }
.community-map-status { display: inline-flex; color: #fff; background: #10b981; padding: 4px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; }
h3 { font-size: 21px; font-weight: 800; margin: 8px 0 3px; }
.community-map-region { font-size: 12px; color: var(--map-muted); }
.community-map-card p { font-size: 13px; line-height: 1.7; margin: 10px 0; }
details { font-size: 12px; border-block: 1px solid var(--map-line); margin: 12px 0; }
summary { padding: 10px 0; cursor: pointer; color: #047857; font-weight: 700; }
dl { font-size: 12px; display: grid; gap: 7px; margin: 12px 0; }
dl > div { display: flex; flex-wrap: wrap; gap: 3px 8px; }
dt { color: var(--map-muted); }
dd { font-weight: 600; }
.community-map-disclaimer { color: var(--map-muted); }
a.community-map-source { display: flex; justify-content: space-between; align-items: center; min-height: 44px; border-radius: 9px; padding: 9px 12px; background: #10b981; color: white; font-size: 13px; font-weight: 700; text-decoration: none; }
a.community-map-source:hover { background: #059669; }
a:focus-visible, summary:focus-visible { outline: 2px solid #047857; outline-offset: 3px; }
footer { color: var(--map-muted); font-size: 11px; font-variant-numeric: tabular-nums; margin-top: 10px; }
</style>
