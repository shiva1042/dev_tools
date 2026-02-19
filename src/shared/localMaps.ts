export interface LocalMapImage {
  name: string;
  file: string;
  extent: { xmin: number; ymin: number; xmax: number; ymax: number };
}

export const LOCAL_MAPS: LocalMapImage[] = [
  {
    name: 'World Map (Dark)',
    file: '/maps/world-dark.png',
    extent: { xmin: -180, ymin: -90, xmax: 180, ymax: 90 },
  },
  {
    name: 'World Map (Light)',
    file: '/maps/world-light.png',
    extent: { xmin: -180, ymin: -90, xmax: 180, ymax: 90 },
  },
  {
    name: 'India',
    file: '/maps/india.png',
    extent: { xmin: 68.0, ymin: 6.5, xmax: 97.5, ymax: 37.5 },
  },
];
