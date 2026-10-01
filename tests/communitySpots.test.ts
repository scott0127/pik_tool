import { describe, expect, it } from 'vitest';
import { communitySpots, communityPureSpots, communityCellCorners, filterCommunityPoints } from '../app/utils/communitySpots';
// @ts-ignore — the same geometry library used by the production map.
import { S2 } from 's2-geometry';

describe('community map positions', () => {
  it('maps only explicit pure reports with one decor and finite coordinates', () => {
    const eligible = communitySpots.filter(spot => spot.status === 'reported_pure' && spot.decorIds.length === 1 && Number.isFinite(spot.lat) && Number.isFinite(spot.lng));
    expect(eligible.length).toBeGreaterThan(1000);
    expect(communityPureSpots.map(spot => spot.id)).toEqual(eligible.map(spot => spot.id));
    expect(communityPureSpots.some(spot => spot.status === 'mixed' || spot.status === 'unverified')).toBe(false);
  });
  it('assigns the containing L17 cell and usable Leaflet corners', () => {
    for (const spot of communityPureSpots) {
      expect(S2.idToKey(spot.cellId)).toBe(S2.latLngToKey(spot.lat, spot.lng, 17));
      const corners = communityCellCorners(spot.cellId);
      expect(corners).toHaveLength(4);
      expect(spot.lat).toBeGreaterThanOrEqual(Math.min(...corners.map(p => p[0])));
      expect(spot.lat).toBeLessThanOrEqual(Math.max(...corners.map(p => p[0])));
      expect(spot.lng).toBeGreaterThanOrEqual(Math.min(...corners.map(p => p[1])));
      expect(spot.lng).toBeLessThanOrEqual(Math.max(...corners.map(p => p[1])));
    }
  });
  it('combines selected decor and viewport boundaries; clearing hides all points', () => {
    const spot = communityPureSpots[0]!;
    const bounds = { north: spot.lat + .0001, south: spot.lat - .0001, east: spot.lng + .0001, west: spot.lng - .0001 };
    const visible = filterCommunityPoints(spot.decorIds, bounds);
    expect(visible).toContain(spot);
    expect(visible.every(p => p.decorIds[0] === spot.decorIds[0] && p.lat <= bounds.north && p.lat >= bounds.south && p.lng <= bounds.east && p.lng >= bounds.west)).toBe(true);
    expect(filterCommunityPoints([], bounds)).toEqual([]);
    expect(filterCommunityPoints(['__not_a_decor__'])).toEqual([]);
  });
});
