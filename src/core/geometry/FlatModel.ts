import type { Point2D, Vector2D } from "./Coordinates.js";
import type { GeometryModel } from "./GeometryModel.js";

export class FlatModel implements GeometryModel {
  /**
   * Superfície plana: z = 0
   */
  surfaceHeightAt(x: number): number {
    return 0;
  }

  /**
   * Interseção de um raio com o plano z = 0
   * Retorna a distância escalar s ao longo do raio, ou null
   */
  intersectRay(
    origin: Point2D,
    direction: Vector2D
  ): number | null {
    const z0 = origin.z; //10
    const dz = direction.z; //-0,0000009999999999995

    // Raio paralelo ao plano
    if (Math.abs(dz) < 1e-12) {
      return null;
    }

    const s = -z0 / dz; //-10 / -0,000000999999999 = 10.000.000,01

    // Interseção atrás do observador
    if (s <= 0) {
      return null;
    }

    return s;
  }
}
