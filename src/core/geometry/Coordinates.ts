/**
 * ============================================================================
 * SISTEMA DE COORDENADAS 2D DO SIMULADOR
 * ============================================================================
 *
 * Este arquivo define a base matemática e geométrica utilizada por todo o
 * simulador de horizonte e propagação de raios.
 *
 * O simulador utiliza um plano cartesiano 2D:
 *
 *   z ↑
 *     |
 *     |
 *     |
 *     |
 *     +----------------→ x
 *
 * Onde:
 *
 * - eixo x:
 *   representa deslocamento horizontal ao longo da superfície
 *
 * - eixo z:
 *   representa altura vertical
 *
 * A utilização de um sistema 2D é suficiente nesta etapa porque estamos
 * modelando apenas um corte vertical da cena, semelhante a observar a Terra
 * "de lado".
 *
 * Isso reduz drasticamente a complexidade matemática sem perder a física
 * essencial do horizonte geométrico.
 *
 * ============================================================================
 * PONTOS VS VETORES
 * ============================================================================
 *
 * O simulador diferencia:
 *
 * - pontos:
 *   representam POSIÇÕES absolutas no espaço
 *
 * - vetores:
 *   representam DIREÇÃO e INTENSIDADE (deslocamento)
 *
 * Exemplo:
 *
 * Ponto:
 *   { x: 1000, z: 50 }
 *
 * significa:
 *   "um objeto localizado 1000 m horizontalmente e 50 m acima"
 *
 * Vetor:
 *   { x: 1, z: -0.01 }
 *
 * significa:
 *   "uma direção apontando para frente e levemente para baixo"
 *
 * ============================================================================
 * NORMALIZAÇÃO
 * ============================================================================
 *
 * Em óptica geométrica e ray tracing, normalmente queremos trabalhar apenas
 * com DIREÇÃO, não com comprimento arbitrário do vetor.
 *
 * Por isso utilizamos vetores normalizados:
 *
 *   comprimento = 1
 *
 * Isso evita distorções nos cálculos geométricos e facilita:
 *
 * - interseção de raios
 * - cálculo de distâncias
 * - propagação óptica
 * - estabilidade numérica
 *
 * ============================================================================
 * BASE MATEMÁTICA
 * ============================================================================
 *
 * A magnitude do vetor é calculada usando o Teorema de Pitágoras:
 *
 *   |v| = sqrt(x² + z²)
 *
 * A normalização é feita dividindo cada componente pela magnitude:
 *
 *   v_normalizado = v / |v|
 *
 * Essas operações pertencem à álgebra vetorial euclidiana clássica,
 * utilizada em:
 *
 * - física
 * - computação gráfica
 * - ray tracing
 * - engenharia
 * - óptica geométrica
 *
 * ============================================================================
 */

// Um ponto representa uma POSIÇÃO ABSOLUTA no espaço.
//
// Exemplo:
//   { x: 1000, z: 50 }
//
// significa:
//   "objeto localizado a 1000 metros horizontalmente
//    e 50 metros acima"
export interface Point2D {

  // Distância horizontal em metros.
  //
  // x > 0:
  //   direita
  //
  // x < 0:
  //   esquerda
  x: number;

  // Altura vertical em metros.
  //
  // z > 0:
  //   acima
  //
  // z < 0:
  //   abaixo
  z: number;
}

// Um vetor representa DIREÇÃO + INTENSIDADE.
//
// Diferente de um ponto, ele NÃO representa localização.
//
// Exemplo:
//
//   { x: 1, z: -0.01 }
//
// significa:
//
// - movimento para direita
// - levemente para baixo
//
// Vetores são fundamentais para representar:
//
// - direção dos raios de luz
// - movimento
// - deslocamentos
// - propagação óptica
export interface Vector2D {

  // Componente horizontal do vetor.
  //
  // Positivo:
  //   direita
  //
  // Negativo:
  //   esquerda
  x: number;

  // Componente vertical do vetor.
  //
  // Positivo:
  //   cima
  //
  // Negativo:
  //   baixo
  z: number;
}

/**
 * Calcula o comprimento (magnitude) de um vetor.
 *
 * Base matemática:
 *
 *   |v| = sqrt(x² + z²)
 *
 * Isso é uma aplicação direta do Teorema de Pitágoras.
 *
 * Exemplo:
 *
 *   v = (3, 4)
 *
 * então:
 *
 *   |v| = sqrt(3² + 4²)
 *        = sqrt(9 + 16)
 *        = sqrt(25)
 *        = 5
 *
 * Interpretação física:
 *
 * A magnitude representa o "tamanho" real do deslocamento.
 */
export function magnitude(v: Vector2D): number {
  
  // Soma pitagórica das componentes horizontal e vertical.
  //
  // Exemplo:
  //
  // sqrt(1² + (-1e-6)²)
  //
  // = sqrt(1 + 0.000000000001)
  //
  // ≈ 1.0000000000005
  return Math.sqrt(v.x * v.x + v.z * v.z);
}

/**
 * Normaliza um vetor.
 *
 * Objetivo:
 *
 * Transformar o vetor para que ele tenha:
 *
 *   comprimento = 1
 *
 * mantendo exatamente a mesma direção.
 *
 * Exemplo:
 *
 *   (10, 10)
 *
 * e
 *
 *   (1, 1)
 *
 * possuem a mesma direção.
 *
 * A normalização remove o "tamanho" do vetor,
 * preservando apenas sua orientação espacial.
 *
 * Isso é extremamente importante em ray tracing,
 * porque queremos representar:
 *
 * - para onde o raio vai
 *
 * e não:
 *
 * - quão "forte" é o vetor
 */
export function normalize(v: Vector2D): Vector2D {

  // Comprimento original do vetor.
  const mag = magnitude(v);

  return {

    // Divide cada componente pelo comprimento total.
    //
    // Isso faz o vetor passar a ter magnitude 1.
    //
    // Exemplo:
    //
    // 1 / 1.0000000000005
    //
    // ≈ 0.9999999999995
    x: v.x / mag,

    // Exemplo:
    //
    // -1e-6 / 1.0000000000005
    //
    // ≈ -0.0000009999999999995
    z: v.z / mag,
  };
}
