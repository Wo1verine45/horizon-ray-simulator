/**
 * ============================================================================
 * INTERFACE ABSTRATA DE GEOMETRIA DO SIMULADOR
 * ============================================================================
 *
 * Este arquivo define a "linguagem geométrica comum" utilizada pelo motor
 * físico do simulador.
 *
 * Em vez do sistema depender diretamente de um modelo específico
 * (Terra curva, Terra plana, etc.), ele depende desta interface genérica.
 *
 * Isso é um conceito fundamental de engenharia de software chamado:
 *
 *   ABSTRAÇÃO
 *
 * ============================================================================
 * OBJETIVO CIENTÍFICO
 * ============================================================================
 *
 * O simulador foi projetado para comparar diferentes modelos geométricos:
 *
 * - Terra curva
 * - Terra plana
 * - modelos futuros
 *
 * mantendo exatamente o mesmo motor de propagação óptica.
 *
 * Isso é extremamente importante cientificamente porque:
 *
 * - o algoritmo de ray tracing permanece o mesmo
 * - apenas a geometria muda
 *
 * Dessa forma, qualquer diferença observada no comportamento dos raios
 * será consequência da geometria do modelo, e não de mudanças no algoritmo.
 *
 * ============================================================================
 * O QUE ESTA INTERFACE DEFINE
 * ============================================================================
 *
 * Todo modelo geométrico do simulador DEVE saber:
 *
 * 1) Qual é a altura da superfície em determinado ponto
 *
 *    Exemplo:
 *    - em uma Terra plana:
 *        z = 0
 *
 *    - em uma Terra curva:
 *        z depende da curvatura
 *
 *
 * 2) Como um raio interage com essa superfície
 *
 *    Ou seja:
 *
 *    - o raio atinge a superfície?
 *    - em qual distância?
 *    - existe horizonte geométrico?
 *
 * ============================================================================
 * IMPORTÂNCIA ARQUITETURAL
 * ============================================================================
 *
 * Graças a esta interface, o restante do simulador poderá trabalhar sem
 * saber qual geometria está sendo usada.
 *
 * Exemplo:
 *
 *   const model: GeometryModel = new EarthModel()
 *
 * ou:
 *
 *   const model: GeometryModel = new FlatModel()
 *
 * O motor óptico continuará funcionando da mesma maneira.
 *
 * Isso segue princípios clássicos de:
 *
 * - programação orientada a interfaces
 * - desacoplamento arquitetural
 * - engenharia de motores físicos
 *
 * ============================================================================
 * IMPORTÂNCIA FÍSICA
 * ============================================================================
 *
 * Em óptica geométrica, o comportamento dos raios depende diretamente da
 * geometria do meio e das superfícies.
 *
 * Esta interface representa exatamente isso:
 *
 * - uma superfície física
 * - e sua interação com raios ópticos
 *
 * ============================================================================
 */

import type { Point2D, Vector2D } from "./Coordinates.js";

/**
 * Interface base para qualquer modelo geométrico do simulador.
 *
 * Qualquer geometria implementada deve fornecer:
 *
 * - a forma da superfície
 * - a interação entre raios e essa superfície
 */
export interface GeometryModel {
  
  /**
   * Retorna a altura da superfície em determinada posição horizontal.
   *
   * Conceito físico:
   *
   * Esta função descreve o "formato do mundo".
   *
   * Exemplos:
   *
   * Terra plana:
   *
   *   z = 0
   *
   * Terra curva:
   *
   *   z = sqrt(R² - x²)
   *
   * (referencial com o centro da Terra na origem (0,0); o observador
   * fica em z = R + h_obs, logo o "chão" abaixo dele está em z = R)
   *
   * Interpretação:
   *
   * Dado um ponto horizontal x,
   * queremos descobrir:
   *
   *   "qual é a altura da superfície naquele local?"
   *
   * Isso será extremamente importante futuramente para:
   *
   * - renderização do terreno
   * - cálculo de obstrução
   * - detecção de visibilidade
   * - ray marching
   * - propagação atmosférica
   */
  surfaceHeightAt(x: number): number;

  /**
   * Calcula a interseção entre um raio e a superfície.
   *
   * Conceito matemático:
   *
   * Queremos descobrir se a reta do raio:
   *
   *   P(s) = origem + s * direção
   *
   * cruza a superfície do modelo geométrico.
   *
   * Conceito físico:
   *
   * Isso representa:
   *
   * - um raio de luz atingindo o solo
   * - o horizonte geométrico
   * - obstrução visual
   * - linha de visão
   *
   * =========================================================================
   * PARÂMETROS
   * =========================================================================
   *
   * origin:
   *   ponto inicial do raio
   *
   * direction:
   *   direção do raio
   *   (normalmente normalizada)
   *
   * =========================================================================
   * RETORNO
   * =========================================================================
   *
   * Retorna:
   *
   * - número:
   *     distância escalar ao longo do raio até a interseção
   *
   * - null:
   *     o raio nunca atinge a superfície
   *
   * Exemplo físico:
   *
   * Se:
   *
   *   s = 1000
   *
   * então:
   *
   *   o raio atinge a superfície após percorrer 1000 metros
   */
  intersectRay(
    origin: Point2D,
    direction: Vector2D
  ): number | null;
}
