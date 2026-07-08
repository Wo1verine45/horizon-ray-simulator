/**
 * ============================================================================
 * MODELO GEOMÉTRICO DE TERRA ESFÉRICA
 * ============================================================================
 *
 * Este arquivo implementa a geometria de uma Terra esférica para o simulador,
 * em contraste com a Terra plana infinita de `FlatModel.ts`.
 *
 * ============================================================================
 * REFERENCIAL ADOTADO
 * ============================================================================
 *
 * O centro da Terra é posicionado na origem do plano 2D:
 *
 *   centro = (0, 0)
 *
 * A superfície da Terra é o círculo de raio R em torno desse centro:
 *
 *   x² + z² = R²
 *
 * O observador fica sobre a superfície, deslocado verticalmente pela sua
 * altura de olhos:
 *
 *   observador em z = R + h_obs
 *
 * Ou seja, o "chão" logo abaixo do observador (em x = 0) está em z = R,
 * e não em z = 0. Esse é o mesmo referencial usado por `surfaceHeightAt`,
 * `intersectRay` e `horizonDistance` — os três métodos deste arquivo
 * precisam concordar entre si, senão um observador "flutua" acima ou
 * afunda abaixo da superfície de forma inconsistente entre eles.
 *
 *
 * ============================================================================
 * OBJETIVO CIENTÍFICO
 * ============================================================================
 *
 * Assim como o `FlatModel.ts`, este modelo existe para permitir comparação
 * geométrica controlada: o mesmo algoritmo de ray tracing deve funcionar
 * sobre `EarthModel` e `FlatModel` sem alterações, de modo que qualquer
 * diferença observada no comportamento dos raios (existência de horizonte,
 * distância até ele, etc.) venha exclusivamente da curvatura da superfície.
 *
 * ============================================================================
 * VISÃO GERAL DOS MÉTODOS
 * ============================================================================
 *
 * - `surfaceHeightAt`: altura da superfície esférica em cada posição x.
 * - `intersectRay`: onde (se em algum ponto) um raio encontra essa
 *   superfície — resolvido via interseção reta-círculo.
 * - `horizonDistance`: fórmula fechada (Pitágoras) para a distância até o
 *   horizonte, usada como referência analítica independente para validar
 *   o resultado numérico de `intersectRay`.
 *
 * ============================================================================
 */

import type { Point2D, Vector2D } from "./Coordinates.js";
import type { GeometryModel } from "./GeometryModel.js";

export class EarthModel implements GeometryModel {
  readonly radius: number;

  /**
   * @param radius Raio da Terra em metros. O padrão, 6.371.000 m, é o raio
   * médio da Terra (a Terra real não é uma esfera perfeita, mas essa média
   * é a aproximação esférica padrão usada em cálculos de horizonte).
   */
  constructor(radius: number = 6371000) {
    this.radius = radius;
  }

  /**
   * Retorna a altura da superfície esférica na posição horizontal x.
   *
   * =========================================================================
   * BASE MATEMÁTICA
   * =========================================================================
   *
   * A superfície é o círculo de raio R centrado na origem:
   *
   *   x² + z² = R²
   *
   * Isolando z (assumindo o hemisfério superior, onde vive o observador):
   *
   *   z = sqrt(R² - x²)
   *
   * =========================================================================
   * INTERPRETAÇÃO FÍSICA
   * =========================================================================
   *
   * Em x = 0, a altura da superfície é exatamente R — o topo da esfera,
   * logo abaixo do observador (que está em z = R + h_obs).
   *
   * Conforme x se afasta de 0, a superfície esférica "cai" em relação a
   * esse topo, porque a Terra se curva para longe do observador. Essa queda
   * é o que faz existir um horizonte geométrico: quanto mais longe, mais a
   * superfície se afasta da linha de visão horizontal.
   *
   * Exemplo: para x pequeno comparado a R, essa queda é aproximadamente
   * x² / (2R) — a mesma aproximação usada para estimar a "curvatura visível"
   * em distâncias do dia a dia (ver teste correspondente em
   * `geometry.test.ts`).
   */
  surfaceHeightAt(x: number): number {
    return Math.sqrt(this.radius * this.radius - x * x);
  }

  /**
   * Calcula a interseção entre um raio e a superfície esférica da Terra.
   *
   * =========================================================================
   * POR QUE ISSO VIRA UMA EQUAÇÃO QUADRÁTICA
   * =========================================================================
   *
   * O raio é descrito parametricamente por:
   *
   *   x(s) = ox + s·dx
   *   z(s) = oz + s·dz
   *
   * e a superfície pela equação do círculo:
   *
   *   x² + z² = R²
   *
   * Substituindo x(s) e z(s) na equação do círculo:
   *
   *   (ox + s·dx)² + (oz + s·dz)² = R²
   *
   * Expandindo os quadrados e agrupando por potência de s, chegamos a uma
   * equação quadrática padrão em s:
   *
   *   a·s² + b·s + c = 0
   *
   * com:
   *
   *   a = dx² + dz²
   *   b = 2·(ox·dx + oz·dz)
   *   c = ox² + oz² - R²
   *
   * =========================================================================
   * SIGNIFICADO FÍSICO DOS COEFICIENTES
   * =========================================================================
   *
   * - a = dx² + dz²: é o quadrado do comprimento do vetor direção. Se a
   *   direção estiver normalizada (como em `normalize()`, ver
   *   `Coordinates.ts`), a ≈ 1.
   * - c = ox² + oz² - R²: compara a distância do ponto de origem ao centro
   *   da Terra com o raio R. Se o observador está fora da esfera (caso
   *   normal), c > 0.
   * - b relaciona a posição inicial com a direção do raio: seu sinal indica
   *   se o raio está, a partir da origem, se aproximando ou se afastando do
   *   centro da Terra.
   *
   * =========================================================================
   * O DISCRIMINANTE (delta)
   * =========================================================================
   *
   *   delta = b² - 4ac
   *
   * Geometricamente, delta descreve quantos pontos a reta do raio (infinita
   * nos dois sentidos) tem em comum com o círculo:
   *
   * - delta < 0: a reta passa ao largo da Terra — nenhuma interseção.
   * - delta = 0: a reta tangencia a superfície — um único ponto de contato
   *   (esse é exatamente o caso-limite do horizonte geométrico).
   * - delta > 0: a reta cruza o círculo em dois pontos distintos (entrando
   *   e saindo da esfera).
   *
   * =========================================================================
   * POR QUE ESCOLHER O MENOR s POSITIVO
   * =========================================================================
   *
   * As duas soluções s1 e s2 da fórmula quadrática correspondem aos dois
   * pontos onde a reta (não o raio, que só existe para s ≥ 0) cruza o
   * círculo. Como a Terra é um sólido opaco, o raio de luz para no primeiro
   * contato com a superfície — ou seja, no menor valor de s que ainda esteja
   * à frente do observador (s > 0). Soluções com s ≤ 0 ficam atrás da
   * origem do raio e são descartadas.
   */
  intersectRay(origin: Point2D, direction: Vector2D): number | null {
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
   * Distância até o horizonte geométrico, dada a altura do observador.
   *
   * =========================================================================
   * DEDUÇÃO GEOMÉTRICA (TEOREMA DE PITÁGORAS)
   * =========================================================================
   *
   * O horizonte geométrico é o ponto da superfície onde a linha de visão do
   * observador é tangente à esfera da Terra. Uma propriedade da tangente a
   * um círculo é que ela forma um ângulo reto com o raio da circunferência
   * no ponto de tangência.
   *
   * Isso forma um triângulo retângulo com:
   *
   * - hipotenusa: do centro da Terra até o olho do observador, de
   *   comprimento (R + h_obs)
   * - um cateto: do centro da Terra até o ponto do horizonte, de
   *   comprimento R (raio da Terra)
   * - outro cateto: a própria linha de visão, do observador até o
   *   horizonte, de comprimento d — é isso que queremos calcular
   *
   * Pelo Teorema de Pitágoras:
   *
   *   d² + R² = (R + h_obs)²
   *
   * Isolando d:
   *
   *   d = sqrt((R + h_obs)² - R²)
   *
   * =========================================================================
   * POR QUE ESTE MÉTODO EXISTE SEPARADO DE intersectRay
   * =========================================================================
   *
   * `intersectRay` resolve o problema geral de interseção raio-superfície
   * numericamente (via equação quadrática) para qualquer direção de raio.
   * `horizonDistance` resolve apenas o caso especial do raio tangente
   * (o horizonte) através de uma fórmula fechada, direta da geometria
   * euclidiana clássica. Por serem dois caminhos matemáticos independentes
   * para descrever o mesmo fenômeno físico, esta fórmula serve como
   * referência analítica para validar o comportamento de `intersectRay`
   * perto do horizonte (ver `geometry.test.ts`).
   */
  horizonDistance(observerHeight: number): number {
    if (observerHeight < 0) {
      // Fisicamente, "altura do observador" não tem sentido negativo neste
      // modelo: o observador está sobre a superfície ou acima dela.
      throw new Error("Altura do observador não pode ser negativa");
    }

    return Math.sqrt(
      Math.pow(this.radius + observerHeight, 2) -
      Math.pow(this.radius, 2)
    );
  }
}
