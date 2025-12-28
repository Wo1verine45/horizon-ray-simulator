import type { Point2D, Vector2D } from "./Coordinates.js";
import type { GeometryModel } from "./GeometryModel.js";

export class EarthModel implements GeometryModel {
  readonly radius: number;

  constructor(radius: number = 6371000) {
    this.radius = radius;
  }

  surfaceHeightAt(x: number): number {
    // Superfície curva aproximada localmente
    // z = R - sqrt(R^2 - x^2)
    return this.radius - Math.sqrt(this.radius * this.radius - x * x);
  }

  /**
   * Interseção de um raio com a superfície da Terra
   * Implementação geométrica 2D
   */
  intersectRay(origin: Point2D, direction: Vector2D): number | null {
    // Equação do círculo: x² + z² = R²
    // Raio: (x, z) = origin + s * direction

    const ox = origin.x; //0
    const oz = origin.z; //6371010
    const dx = direction.x; //0,9999999999995
    const dz = direction.z; //-0,0000009999999999995

    const a = dx * dx + dz * dz; //0,9999999999995*0,9999999999995 + -0,0000009999999999995*-0,0000009999999999995 = 0,999999999999 + 0,0000000000009999999998 = 0,9999999999999999
    const b = 2 * (ox * dx + oz * dz); // 2 * (0 * 0,9999999999995 + 6371010 * -0,0000009999999999995) = 2 * (0 - 6,37100999362899) = 2 * -6,37100999362899 = -12,74201998725798
    const c = ox * ox + oz * oz - this.radius * this.radius; //0 * 0 + 6371010 * 6371010 - 6371000 * 6371000 = 40.589.768.420.100 - 40.589.641.000.000 = 127.420.100

    const delta = b * b - 4 * a * c; // -12,74201998725798 * -12,74201998725798 - 4 * 0,999999999999999 * 127.420.100 = 162,3590733556819 - 509.680.399,9999995 = -509.680.237,6409261

    if (delta < 0) return null;

    const sqrtDelta = Math.sqrt(delta); //sqrt(15.726.176.000) = 125.404,0509712505
    const s1 = (-b - sqrtDelta) / (2 * a); //(--127420,2 - 125.404,0509712505) / (2 * 1.0001) = 2.016,1490287495 / 2,0002 = 1.007,97371700305
    const s2 = (-b + sqrtDelta) / (2 * a); //(--127420,2 + 125.404,0509712505) / (2 * 1.0001) = 252.824,2509712505 / 2,0002 = 126.399,4855370715

    // Escolher o menor s POSITIVO
    const candidates = [s1, s2].filter(s => s > 0); //1.007,97371700305

    if (candidates.length === 0) {
      return null;
    }

    return Math.min(...candidates);
  }

  /**
   * Mantido por validação analítica
   */
  horizonDistance(observerHeight: number): number {
    if (observerHeight < 0) {
      throw new Error("Altura do observador não pode ser negativa");
    }

    return Math.sqrt(
      Math.pow(this.radius + observerHeight, 2) -
      Math.pow(this.radius, 2)
    );
  }
}
