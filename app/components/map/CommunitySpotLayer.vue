<template>
  <template v-if="zoom >= 17">
    <LPolygon v-for="cell in cells" :key="'community-cell-' + cell.cellId" :lat-lngs="cell.corners" color="#10b981" :weight="2" :opacity="0.85" :fill-opacity="0.025" fill-color="#10b981" dash-array="4 6" :interactive="false" />
  </template>
  <LMarker v-for="spot in spots" :key="spot.id" :lat-lng="[spot.lat, spot.lng]" :z-index-offset="focusedId === spot.id ? 900 : 300" :options="{ title: $t('map.community.map_point') + ' · ' + $t('decor_types.' + spot.decorIds[0]), keyboard: true }" @ready="markerReady(spot.id, $event)" @click="$emit('select', spot.id)" @popupclose="$emit('close', spot.id)">
    <LIcon :icon-size="[48, 60]" :icon-anchor="[24, 56]" :popup-anchor="[0, -48]" class-name="community-point-icon">
      <div class="community-point" :class="{ 'is-selected': focusedId === spot.id }" :data-community-point="spot.id"><span class="community-point-paper"></span><span class="community-point-face"><Icon :name="getDecorRule(spot.decorIds[0]!)?.iconName || 'lucide:map-pin'" class="h-6 w-6" /></span><span class="community-point-label">{{ $t('map.community.pin_label') }}</span><span class="community-point-dot"></span></div>
    </LIcon>
    <LPopup :options="popupOptions" @ready="popupReady(spot.id)"><CommunitySpotCard :spot="spot" /></LPopup>
  </LMarker>
</template>

<script setup lang="ts">
import { LMarker, LIcon, LPopup, LPolygon } from '@vue-leaflet/vue-leaflet';
import { communityCellCorners, type LocatedCommunitySpot } from '~/utils/communitySpots';
import CommunitySpotCard from './CommunitySpotCard.vue';
const props = defineProps<{ spots: LocatedCommunitySpot[]; zoom: number; focusedId: string | null; popupOptions: Record<string, unknown> }>();
defineEmits<{ select: [id: string]; close: [id: string] }>();
const { getDecorRule } = useDecorRules();
const cells = computed(() => [...new Set(props.spots.map(spot => spot.cellId))].map(cellId => ({ cellId, corners: communityCellCorners(cellId) })));
const markers = new Map<string, { openPopup: () => void }>();
const readyPopups = new Set<string>();
const openFocused = async (id: string) => {
  await nextTick();
  if (props.focusedId === id && readyPopups.has(id)) markers.get(id)?.openPopup();
};
const markerReady = (id: string, marker: { openPopup: () => void }) => {
  markers.set(id, marker);
  void openFocused(id);
};
const popupReady = (id: string) => { readyPopups.add(id); void openFocused(id); };
watch(() => props.focusedId, id => { if (id) void openFocused(id); });
watch(() => props.spots, spots => {
  const visible = new Set(spots.map(spot => spot.id));
  for (const id of markers.keys()) if (!visible.has(id)) { markers.delete(id); readyPopups.delete(id); }
});
onUnmounted(() => { markers.clear(); readyPopups.clear(); });
</script>

<style scoped>
.community-point { position: relative; width: 48px; height: 60px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.community-point-paper { position: absolute; inset: 3px 3px 17px 3px; background: #c4decf; border-radius: 12px; transform: rotate(-8deg); box-shadow: 0 4px 9px #244f3430; }
.community-point-face { position: absolute; inset: 0 4px 20px; display: grid; place-items: center; background: #faf9f1; border: 2px solid #10b981; border-radius: 11px; box-shadow: inset 0 0 0 2px white; transition: transform 200ms, box-shadow 200ms; }
.community-point-label { position: absolute; top: 31px; left: 5px; right: 5px; height: 17px; display: grid; place-items: center; background: #10b981; color: white; border: 1px solid #faf9f1; border-radius: 4px; font-size: 9px; font-weight: 800; line-height: 1; letter-spacing: .06em; }
.community-point-dot { position: absolute; bottom: 0; left: 20px; width: 8px; height: 8px; border: 2px solid white; border-radius: 50%; background: #10b981; box-shadow: 0 1px 3px #244f3450; }
.is-selected .community-point-face { transform: translateY(-3px) rotate(3deg); box-shadow: 0 0 0 4px #10b98135; }
@media (hover: hover) { .community-point:hover .community-point-face { transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce) { .community-point-face { transition: none; } }
</style>
