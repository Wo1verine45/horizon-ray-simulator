// Sistema de coordenadas 2D para o simulador
// Eixo x: horizontal (ao longo da superfície)
// Eixo z: vertical (altura)

export interface Point2D {
  x: number; // distância horizontal (m)
  z: number; // altura (m)
}

export interface Vector2D {
  x: number;
  z: number;
}

export function magnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.z * v.z);
}

export function normalize(v: Vector2D): Vector2D {
  const mag = magnitude(v);
  return {
    x: v.x / mag,
    z: v.z / mag,
  };
}
