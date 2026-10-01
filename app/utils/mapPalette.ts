// The same quantity colors are used by polygons, badges, cards and the legend.
export const MAP_GRID_PALETTE = {
  single: { color: '#2c9d70', soft: '#e1f2e8', ink: '#236549' },
  mixed: { color: '#d8ad3b', soft: '#fff1c9', ink: '#7e5d15' },
  complex: { color: '#cc6258', soft: '#fae2dd', ink: '#99473f' },
  roadside: { color: '#99a7a0', soft: '#edf0ed', ink: '#596b62' },
  reported: { color: '#897687', soft: '#eee7ed', ink: '#71546d' },
} as const;

export function getGridPalette(count: number, reported = false) {
  if (reported) return MAP_GRID_PALETTE.reported;
  if (count === 0) return MAP_GRID_PALETTE.roadside;
  if (count === 1) return MAP_GRID_PALETTE.single;
  return count <= 3 ? MAP_GRID_PALETTE.mixed : MAP_GRID_PALETTE.complex;
}
