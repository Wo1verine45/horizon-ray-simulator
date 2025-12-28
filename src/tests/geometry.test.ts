import { EarthModel } from "../core/geometry/EarthModel.js";
import { FlatModel } from "../core/geometry/FlatModel.js";
import { normalize } from "../core/geometry/Coordinates.js";

describe("Horizonte geométrico — Terra curva vs. plana", () => {

  test("Horizonte a partir de 0 m deve ser 0 m", () => {
    const earth = new EarthModel();
    const d = earth.horizonDistance(0);
    expect(d).toBeCloseTo(0, 6);
  });

  test("Horizonte a partir de 1,70 m (~olhos humanos)", () => {
    const earth = new EarthModel();
    const d = earth.horizonDistance(1.7);

    // Valor esperado ≈ 4.65 km
    expect(d / 1000).toBeCloseTo(4.65, 2);
  });

  test("Horizonte cresce com a altura", () => {
    const earth = new EarthModel();

    const d1 = earth.horizonDistance(1.7);
    const d2 = earth.horizonDistance(10);

    expect(d2).toBeGreaterThan(d1);
  });

  test("Terra plana não possui horizonte geométrico para raio horizontal", () => {
    const model = new FlatModel();

    const observer = { x: 0, z: 10 }; // 10 m acima do solo
    const direction = normalize({ x: 1, z: 0 }); // raio horizontal

    const hit = model.intersectRay(observer, direction);

    expect(hit).toBeNull();
  });

  test("Terra curva intersecta a superfície para raio suficientemente descendente", () => {
    const R = 6371000;
    const model = new EarthModel(R);

    const observer = { x: 0, z: R + 10 };
    const direction = normalize({ x: 1, z: -0.01 });

    const hit = model.intersectRay(observer, direction);

    expect(hit).not.toBeNull();
    expect(hit!).toBeGreaterThan(0);
  });

  test("Raio quase horizontal não atinge a Terra curva", () => {
    const curved = new EarthModel(6371000);

    const observer = { x: 0, z: 6371000 + 10 };
    const dir = normalize({ x: 1, z: -1e-6 });

    const hit = curved.intersectRay(observer, dir);

    expect(hit).toBeNull();
  });

  test("Terra plana e curva divergem para raio quase horizontal", () => {
    const flat = new FlatModel();
    const curved = new EarthModel(6371000);

    const dir = normalize({ x: 1, z: -1e-6 });

    const observerFlat = { x: 0, z: 10 };
    const observerCurved = { x: 0, z: 6371000 + 10 };

    const hitFlat = flat.intersectRay(observerFlat, dir);
    const hitCurved = curved.intersectRay(observerCurved, dir);

    expect(hitFlat).not.toBeNull();  // plano sempre cruza
    expect(hitCurved).toBeNull();    // curvo não cruza
  });

});
