# OSM Spatial Data Pipeline

## Scope

This document covers the spatial data path used by `map.vue`:

1. `parse-taiwan.ts` reads a local PBF and emits chunk files.
2. `merge-taiwan.ts` assigns every generated point to one frontend tile.
3. `build-s2-singletons.ts` derives Level 17 single-decor cells.
4. `split-single-cells.cjs` writes one static file per decor type.
5. `encode-s2-cells.cjs` losslessly delta-encodes S2 cell IDs.
6. `useLocalFirstPOI.ts` selects local region data and loads intersecting tiles.
7. `useS2Grid.ts` and `map.vue` calculate and render the visible grid at the
   current map zoom.

The existing decor rule arrays and their first-match behavior are intentionally
outside this work. Spatial maintenance must not silently change tags, rule
order, regional decor semantics, or the mapping from OSM tags to decor types.

## Spatial Invariants

- A query may use a local region only when that region itself fully contains
  the query bounds. An overlapping smaller region must not cause another,
  non-containing region to be selected.
- `taiwan_main_island` is the primary local dataset. The older Taipei artifact
  is only a fallback when the primary index cannot be loaded.
- A finite point inside the region belongs to exactly one tile. South/west
  boundaries are inclusive; exact north/east region boundaries are clamped to
  the final row or column.
- A feature may be split across multiple tiles, but the same
  `feature id + latitude + longitude` point must not be duplicated.
- Tile index bounds, tile file bounds, and the configured `N x N` grid must
  agree without gaps or overlaps.
- Split output is built in a staging directory and atomically swapped into
  place, so removed decor types cannot leave stale pure-cell files.
- S2 deltas are JSON numbers only while they are safe integers. Larger deltas
  are decimal strings and are decoded with `BigInt`.
- One pure S2 cell cannot appear in two decor-type files.
- Failed index, tile, or region fetches are not permanently cached; a later
  request can retry.
- If any required local tile fails to load, the whole query falls back to the
  API instead of presenting an incomplete local result as complete.
- Points from a feature split across multiple tiles receive tile-scoped UI IDs,
  preventing duplicate Vue keys while retaining the original feature ID in the
  static tile data.
- Grid mode and pure mode each own one polygon layer. Pure cells must not be
  mounted through both the general grid layer and the pure-mode layer.

## Region Selection

`useLocalFirstPOI.ts` checks supported regions in priority order:

1. `taiwan_main_island`
2. `taipei`

The selected region must fully contain the Leaflet query bounds. Tile loading
then uses bounding-box intersection against that region's tile index and
per-point filtering against the exact query bounds.

This prevents the previous overlap error where a query contained by Taipei
could set a shared flag and then accidentally select the first merely
intersecting region.

## Merge And Split

`merge-taiwan.ts` computes a tile row and column directly from each point:

```text
row = floor((lat - region.south) / latitudeStep)
col = floor((lon - region.west) / longitudeStep)
```

Values are accepted only after strict region validation. Exact north/east
border values are clamped to the final tile. The point is written to only that
bucket.

`split-single-cells.cjs` writes a complete new set to a fixed staging directory.
It verifies that the sum of per-type cells equals the source cell count, then
swaps the staging directory into place. An interrupted swap restores the prior
`single` directory from its fixed backup.

`encode-s2-cells.cjs` verifies every encoded file by decoding it before
replacing the source file. Any file error, unsafe numeric representation, or
round-trip mismatch makes the command exit non-zero.

## Zoom And Rendering

The map renders Level 17 S2 polygons only at Leaflet zoom 17 or higher.
`useS2Grid.ts` walks neighboring S2 cells from the viewport center and reuses
existing cell objects across move/zoom completion to avoid Leaflet layer
flashing.

Pure mode has its own polygon layer because it also owns pure-cell click and
report behavior. The general grid layer returns cells only in grid mode.
Scanner prediction selects the active mode's cells independently, so removing
the duplicate visual mount does not remove scanner behavior.

## Traceability

The source PBF stays outside Git. `parse-stats.json` records:

- parser version;
- absolute local PBF path;
- source file name, byte size, and last modified time;
- SHA-256 of the unchanged parser decor rule array;
- parser settings and counters.

The public `index.json` and `merge-stats.json` copy only the privacy-safe source
manifest, without the absolute local path.

## Rebuild

Run the complete pipeline with an explicit PBF:

```powershell
pnpm exec tsx scripts/osm-fetcher/pipeline-taiwan.ts `
  --pbf "C:\path\to\taiwan-latest.osm.pbf"
```

Rebuild from existing chunks only when they already contain generation 3
source metadata:

```powershell
pnpm exec tsx scripts/osm-fetcher/pipeline-taiwan.ts --skip-parse
```

The `--skip-parse` preflight runs before public output is touched. Old or
untraceable chunks are rejected.

Before merge begins, the complete current region output is renamed to a fixed
pipeline backup. The backup is removed only after both verification steps pass.
Any merge, split, encoding, or verification failure removes the partial output
and restores the previous checked-in region artifact.

## Required Gates

The pipeline reports success only after both checks pass:

1. `verify-spatial-output.ts`
   - validates generation and source metadata;
   - validates every tile ID and bounding box against the configured grid;
   - rejects points assigned outside their unique tile;
   - rejects duplicated feature points after tile splitting;
   - compares per-type point totals, region ID, grid size, and S2 level across
     generated indexes and merge statistics;
   - verifies split counts, cross-type uniqueness, and lossless delta decoding.
2. `verify-kaohsiung-arena.ts`
   - checks the known Kaohsiung Arena area.

The checked-in artifact is currently generation `2.x`. A source PBF is not
stored in this repository, so generation `3.x` cannot be produced from the
repository alone.

These outputs are static files. No Supabase schema or SQL change is required.
Render only needs to deploy the Git revision containing a successfully rebuilt
artifact.
