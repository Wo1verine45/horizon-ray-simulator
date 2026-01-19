// Sistema de coordenadas 2D para o simulador
// Eixo x: horizontal (ao longo da superfície)
// Eixo z: vertical (altura)

// Um ponto (não um vetor) representando posição absoluta no plano.
export interface Point2D {
  x: number; // distância horizontal (m)
  z: number; // altura (m)
}

// Um vetor (diferença entre dois pontos) representando direção e intensidade.
export interface Vector2D {
  x: number; // Se positivo, direção para direita, se negativo, para esquerda
  z: number; // Se positivo, direção para cima, se negativo, para baixo
}
// O número em si diz apenas quanto aquele vetor percorre naquela direção, não sendo muito útil para alguns cálculos, por isso
// normalizamos, um vetor (10, 10) possui a mesma direção de um (1, 1)

// Magnitude corresponde ao comprimento real do vetor, dado por pitágoras.
export function magnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.z * v.z); //sqrt(1*1 + -1e-6*-1e-6) = sqrt(1 + 0,000000000001) = sqrt(1,000000000001) = 1,0000000000005
}

// Quando normalizamos, queremos um vetor na mesma direção, mas com comprimento 1
export function normalize(v: Vector2D): Vector2D {
  const mag = magnitude(v);
  return {
    x: v.x / mag, //1 / 1,0000000000005 = 0,9999999999995
    z: v.z / mag, //-1e-6 / 1,0000000000005 = -0,0000009999999999995
  };
}
