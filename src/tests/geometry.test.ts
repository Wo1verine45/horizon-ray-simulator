import { EarthModel } from "../core/geometry/EarthModel.js";

describe("EarthModel - Horizonte Geométrico", () => {
  test("Horizonte a partir de 0 m deve ser 0 m", () => {
    const earth = new EarthModel();
    const d = earth.horizonDistance(0);
    expect(d).toBeCloseTo(0, 6);
  });

  test("Horizonte a partir de 1,70 m (~olhos humanos)", () => {
    const earth = new EarthModel();
    const d = earth.horizonDistance(1.7);

    /**
   * Distância até o horizonte geométrico
   * Fórmula exata: d = sqrt((R + h)^2 - R^2)
   * h = 1,7
   * R + h = 6.371.001,7
   * (R + h)^2 = 40.589.662.661.402,89
   * R^2 = 40.589.641.000.000
   * (R + h)^2 - R^2 = 21.661.402,89
   * sqrt((R + h)^2 - R^2) = 4.654,181226596145 metros
   */
    // Valor esperado ~ 4.65 km
    expect(d / 1000).toBeCloseTo(4.65, 2);
  });

  test("Horizonte cresce com a altura", () => {
    const earth = new EarthModel();

    const d1 = earth.horizonDistance(1.7);
    const d2 = earth.horizonDistance(10);

    expect(d2).toBeGreaterThan(d1);
  });
});
