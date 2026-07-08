/**
 * ============================================================================
 * TESTES DO NÚCLEO GEOMÉTRICO — TERRA CURVA VS. PLANA
 * ============================================================================
 *
 * Esta suíte valida `EarthModel` e `FlatModel` contra resultados fechados
 * (fórmulas analíticas conhecidas) e contra o comportamento comparativo
 * esperado entre as duas geometrias.
 *
 * A filosofia de validação do projeto (ver `docs/Passo 5`) é privilegiar
 * esse tipo de teste comparativo-analítico — comparar contra uma fórmula
 * fechada, ou comparar um modelo contra o outro sob o mesmo raio — em vez
 * de checagem puramente visual/manual. Isso permite que qualquer pessoa
 * audite o simulador conferindo a matemática por trás de cada valor
 * esperado, sem precisar rodar a simulação visualmente.
 *
 * ============================================================================
 */

import { EarthModel } from "../core/geometry/EarthModel.js";
import { FlatModel } from "../core/geometry/FlatModel.js";
import { normalize } from "../core/geometry/Coordinates.js";

describe("Horizonte geométrico — Terra curva vs. plana", () => {

  /**
   * Caso-limite trivial da fórmula do horizonte:
   *
   *   d = sqrt((R + h)² - R²)
   *
   * Se h = 0 (olho do observador exatamente ao nível do solo, sem nenhuma
   * elevação), a expressão colapsa para sqrt(R² - R²) = 0. Fisicamente,
   * um observador sem altura nenhuma não enxerga "além" de si mesmo.
   */
  test("Horizonte a partir de 0 m deve ser 0 m", () => {
    const earth = new EarthModel();
    const d = earth.horizonDistance(0);
    expect(d).toBeCloseTo(0, 6);
  });

  /**
   * Reproduz o valor de referência clássico para altura de olhos humana
   * (~1,70 m em pé): o horizonte fica a aproximadamente 4,65 km.
   *
   * Esse valor também pode ser conferido pela aproximação bem conhecida
   * (válida porque h ≪ R, então (R+h)² - R² ≈ 2Rh):
   *
   *   d(km) ≈ 3,57 · sqrt(h em metros)
   *
   * Para h = 1,70 m: 3,57 · sqrt(1,70) ≈ 3,57 · 1,304 ≈ 4,65 km,
   * consistente com o valor exato calculado por `horizonDistance`.
   */
  test("Horizonte a partir de 1,70 m (~olhos humanos)", () => {
    const earth = new EarthModel();
    const d = earth.horizonDistance(1.7);

    // Valor esperado ≈ 4.65 km
    expect(d / 1000).toBeCloseTo(4.65, 2);
  });

  /**
   * Valida monotonicidade: quanto maior a altura do observador, mais a
   * curvatura da Terra "revela" superfície adicional antes que a linha de
   * visão a intercepte. Logo, a distância do horizonte só pode crescer (ou
   * no mínimo, nunca diminuir) com o aumento de h.
   */
  test("Horizonte cresce com a altura", () => {
    const earth = new EarthModel();

    const d1 = earth.horizonDistance(1.7);
    const d2 = earth.horizonDistance(10);

    expect(d2).toBeGreaterThan(d1);
  });

  /**
   * Na Terra plana, um raio perfeitamente horizontal (dz = 0) nunca muda
   * de altura — logo nunca cruza z = 0. Isso confirma que, neste modelo,
   * não existe horizonte geométrico causado por curvatura (só obstrução
   * por relevo, que está fora do escopo deste modelo simples).
   */
  test("Terra plana não possui horizonte geométrico para raio horizontal", () => {
    const model = new FlatModel();

    const observer = { x: 0, z: 10 }; // 10 m acima do solo
    const direction = normalize({ x: 1, z: 0 }); // raio horizontal

    const hit = model.intersectRay(observer, direction);

    expect(hit).toBeNull();
  });

  /**
   * Caso "normal" de linha de visão apontando para o chão: com uma
   * inclinação descendente perceptível, o raio sempre encontra a esfera
   * da Terra em algum ponto à frente do observador (s > 0).
   */
  test("Terra curva intersecta a superfície para raio suficientemente descendente", () => {
    const R = 6371000;
    const model = new EarthModel(R);

    const observer = { x: 0, z: R + 10 };
    const direction = normalize({ x: 1, z: -0.01 });

    const hit = model.intersectRay(observer, direction);

    expect(hit).not.toBeNull();
    expect(hit!).toBeGreaterThan(0);
  });

  /**
   * Manifestação geométrica direta do horizonte: mesmo com uma inclinação
   * descendente ínfima (dz = -1e-6), a curvatura da Terra faz a superfície
   * "cair" mais rápido do que o raio desce, então o raio nunca a intercepta.
   */
  test("Raio quase horizontal não atinge a Terra curva", () => {
    const curved = new EarthModel(6371000);

    const observer = { x: 0, z: 6371000 + 10 };
    const dir = normalize({ x: 1, z: -1e-6 });

    const hit = curved.intersectRay(observer, dir);

    expect(hit).toBeNull();
  });

  /**
   * Comparação central que justifica ter as duas geometrias sob a mesma
   * interface (`GeometryModel`): usando exatamente a mesma direção de raio
   * nos dois modelos, isolamos o efeito da geometria. O plano sempre cruza
   * (dado qualquer componente descendente, por menor que seja, ele
   * eventualmente atinge z = 0); o curvo não cruza, porque a curvatura
   * afasta a superfície mais rápido do que a descida do raio.
   */
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

  /**
   * Valida a consistência de referencial entre `surfaceHeightAt` e
   * `intersectRay`/`horizonDistance`:
   *
   * - Em x = 0, o "chão" logo abaixo do observador deve estar em z = R,
   *   o mesmo referencial em que o observador é colocado em z = R + h_obs.
   * - Para x != 0, a superfície se afasta do topo da esfera (curvatura),
   *   então a altura deve ser um pouco menor que R. Essa queda segue a
   *   aproximação de sagita x² / (2R) — a expansão de Taylor de
   *   sqrt(R² - x²) em torno de x = 0, válida para x ≪ R.
   */
  test("surfaceHeightAt da Terra curva usa o mesmo referencial de intersectRay/horizonDistance", () => {
    const R = 6371000;
    const earth = new EarthModel(R);

    expect(earth.surfaceHeightAt(0)).toBeCloseTo(R, 6);

    const h = earth.surfaceHeightAt(5000);
    expect(h).toBeLessThan(R);
    expect(R - h).toBeCloseTo((5000 * 5000) / (2 * R), 3); // aproximação de queda por curvatura
    //TODO: Verifiquei num site de cálculo de curvatura, porque a queda por curvatura não é igual ao quanto o obejto está escondido?
    //TODO: Fazer desenhos didáticos sobre tudo, mas principalmente sobre os cálculos
  });

  /**
   * Reforça a definição do modelo plano: a superfície está sempre em
   * z = 0, independentemente de x.
   */
  test("surfaceHeightAt da Terra plana é sempre zero", () => {
    const flat = new FlatModel();

    expect(flat.surfaceHeightAt(0)).toBe(0);
    expect(flat.surfaceHeightAt(10000)).toBe(0);
  });

});
