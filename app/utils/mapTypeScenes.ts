import decorData from '../data/decor.json';

export type TypeSceneMotion = 'serve' | 'steam' | 'bake' | 'stack' | 'wrap' | 'bag' | 'mirror' | 'charge' | 'fasten' | 'book' | 'write' | 'dispense' | 'snip' | 'wash' | 'mail' | 'stamp' | 'ride' | 'fly' | 'cross' | 'grow' | 'water' | 'climb' | 'ticket' | 'frame' | 'bounce' | 'clap' | 'fortune' | 'rain' | 'snow';

// Rules and collection definitions use different IDs in a few places.
const definitions: Record<string, string> = {
  convenience: 'convenience-store', clothing: 'clothes-store', hair_salon: 'hair-salon',
  laundry: 'laundromat', stationery: 'Stationery Store', post_office: 'post-office',
  bus_stop: 'bus-stop', art_gallery: 'art-gallery', movie_theater: 'movie-theater',
  theme_park: 'theme-park', weather_rain: 'weather-rain', weather_snow: 'weather-snow',
};

export const mapTypeMotions: Record<string, TypeSceneMotion> = {
  restaurant: 'serve', cafe: 'steam', sweetshop: 'stack', bakery: 'bake', burger: 'stack',
  italian: 'serve', ramen: 'steam', sushi: 'serve', curry: 'steam', korean: 'steam', taco: 'wrap',
  convenience: 'bag', supermarket: 'bag', cosmetics: 'mirror', clothing: 'wrap', electronics: 'charge',
  hardware: 'fasten', library: 'book', stationery: 'write', pharmacy: 'dispense', hair_salon: 'snip',
  laundry: 'wash', post_office: 'mail', hotel: 'bag', university: 'stamp',
  station: 'ride', bus_stop: 'ride', airport: 'fly', bridge: 'cross',
  park: 'grow', forest: 'grow', waterside: 'water', beach: 'water', mountain: 'climb', zoo: 'grow',
  theme_park: 'ticket', art_gallery: 'frame', stadium: 'bounce', movie_theater: 'clap', shrine: 'fortune',
  roadside: 'stamp', weather_rain: 'rain', weather_snow: 'snow',
};

export function getMapTypeScene(id: string) {
  const definition = decorData.definitions.find(item => item.category.id === (definitions[id] ?? id));
  const variants = definition?.variants.filter(item => !item.id.includes('rare')) ?? [];
  type Artwork = { imageUrl?: string; imageUrls?: Record<string, string> };
  const first = (variants[0] ?? definition?.variants[0]) as Artwork | undefined;
  const second = (variants[1] ?? first) as Artwork | undefined;
  const primary = first?.imageUrls?.red ?? first?.imageUrls?.blue ?? first?.imageUrl;
  const secondary = second?.imageUrls?.yellow ?? second?.imageUrls?.white ?? second?.imageUrl;
  // Original PNGs stay crisp at high mobile pixel densities; fetch only the active pair.
  const original = (url?: string) => url?.replace('/images/thumb/', '/images/').replace(/\/[^/]+px-[^/]+$/, '') ?? '/images/friends-comic/pikmin-red.png';
  return { motion: mapTypeMotions[id] ?? 'stamp', primary: original(primary), secondary: original(secondary) };
}
