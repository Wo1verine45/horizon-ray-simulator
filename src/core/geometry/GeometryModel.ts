import type { Point2D, Vector2D } from "./Coordinates.js";

export interface GeometryModel {
  /**
   * Altura da superfície no ponto x
   */
  surfaceHeightAt(x: number): number;

  /**
   * Interseção de um raio com a superfície
   * Retorna a distância escalar s ao longo do raio, ou null
   */
  intersectRay(
    origin: Point2D,
    direction: Vector2D
  ): number | null;
}
