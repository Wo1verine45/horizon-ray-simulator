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
  return Math.sqrt(v.x * v.x + v.z * v.z); //sqrt(1*1 + -1e-6*-1e-6) = sqrt(1 + 0,000000000001) = sqrt(1,000000000001) = 1,0000000000005
}

export function normalize(v: Vector2D): Vector2D {
  const mag = magnitude(v);
  return {
    x: v.x / mag, //1 / 1,0000000000005 = 0,9999999999995
    z: v.z / mag, //-1e-6 / 1,0000000000005 = -0,0000009999999999995
  };
}
