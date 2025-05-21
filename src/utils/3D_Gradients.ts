const MIN_RADIUS = 7.5;
const MAX_RADIUS = 15;
const DEPTH = 2;
const NUM_POINTS = 2500;

const randomFromInterval = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export interface PointData {
  position: [number, number, number];
}

export const pointsInner: PointData[] = Array.from(
  { length: NUM_POINTS },
  () => {
    const randomRadius = randomFromInterval(MIN_RADIUS, MAX_RADIUS);
    const randomAngle = Math.random() * Math.PI * 2;

    const x = Math.cos(randomAngle) * randomRadius;
    const y = Math.sin(randomAngle) * randomRadius;
    const z = randomFromInterval(-DEPTH, DEPTH);

    return {
      position: [x, y, z],
    };
  }
);

export const pointsOuter: PointData[] = Array.from(
  { length: NUM_POINTS / 4 },
  () => {
    const randomRadius = randomFromInterval(MIN_RADIUS / 2, MAX_RADIUS * 2);
    const angle = Math.random() * Math.PI * 2;

    const x = Math.cos(angle) * randomRadius;
    const y = Math.sin(angle) * randomRadius;
    const z = randomFromInterval(-DEPTH * 10, DEPTH * 10);

    return {
      position: [x, y, z],
    };
  }
);
