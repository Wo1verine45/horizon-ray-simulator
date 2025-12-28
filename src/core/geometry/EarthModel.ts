// Modelo geométrico da Terra como uma esfera perfeita

export class EarthModel {
  readonly radius: number;

  constructor(radius: number = 6371000) {
    // Raio médio da Terra em metros
    this.radius = radius;
  }

  /**
   * Distância até o horizonte geométrico
   * Fórmula exata: d = sqrt((R + h)^2 - R^2)
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
