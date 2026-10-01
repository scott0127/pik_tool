import data from '~/data/community-spots.json';
// @ts-ignore — s2-geometry does not provide types.
import { S2 } from 's2-geometry';
import type { MapBounds } from '~/types/map';

export interface CommunitySpot {
  id: string; city: string; name: string; decorIds: string[]; standingHint: string;
  searchQuery: string; sourceUrl: string; sourceDate: string; status: string; caution: string;
  lat?: number; lng?: number; confirmationDate?: string; sourceId?: string;
}
export interface LocatedCommunitySpot extends CommunitySpot { lat: number; lng: number; cellId: string }
export const communitySpots: CommunitySpot[] = data.spots;
export const communitySources = data.sources;
export const communityReviewedAt = data.sourceReviewedAt;
export const communitySourceAuthor = (id?: string) => communitySources.find(source => source.id === id)?.author || '';

// Only explicit pure-spot claims are drawn in pure mode. A containing cell is not
// promoted to a verified pure cell and never participates in scanner prediction.
export const communityPureSpots: LocatedCommunitySpot[] = communitySpots
  .filter((spot): spot is CommunitySpot & { lat: number; lng: number } => spot.status === 'reported_pure'
    && spot.decorIds.length === 1 && Number.isFinite(spot.lat) && Number.isFinite(spot.lng))
  .map(spot => ({ ...spot, cellId: S2.keyToId(S2.latLngToKey(spot.lat, spot.lng, 17)) }));

export function filterCommunityPoints(types: string[], bounds?: MapBounds | null) {
  const selected = new Set(types);
  return communityPureSpots.filter(spot => selected.has(spot.decorIds[0]!) && (!bounds || (
    spot.lat <= bounds.north && spot.lat >= bounds.south && spot.lng <= bounds.east && spot.lng >= bounds.west
  )));
}

export function communityCellCorners(cellId: string): [number, number][] {
  return S2.S2Cell.FromHilbertQuadKey(S2.idToKey(cellId)).getCornerLatLngs()
    .map((point: { lat: number; lng: number }) => [point.lat, point.lng]);
}
