// Um neurónio com uma entrada como grafo computacional (secção 4 da aula): ida e volta.
// Sem dependências, para poder ser testado com `node`. Testado contra NumPy 2.5.

export function sigmoide(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function central(f: (t: number) => number, t: number, h = 1e-5): number {
  return (f(t + h) - f(t - h)) / (2 * h);
}

export type NeuronPass = {
  x: number;
  y: number;
  w: number;
  b: number;
  z: number;
  a: number;
  L: number;
  dL_da: number;
  da_dz: number;
  dL_dz: number;
  dL_dw: number;
  dL_db: number;
  /** Verificação com a derivada numérica da secção 2. */
  num_w: number;
  num_b: number;
};

/** As mesmas contas, pela mesma ordem, do código da aula. */
export function neuron(xe: number, ye: number, w: number, b: number): NeuronPass {
  const z = w * xe + b;
  const a = sigmoide(z);
  const L = (a - ye) ** 2;
  const dL_da = 2 * (a - ye);
  const da_dz = a * (1 - a);
  const dL_dz = dL_da * da_dz;
  const dL_dw = dL_dz * xe;
  const dL_db = dL_dz * 1;
  const perdaNeuronio = (w_: number, b_: number) => (sigmoide(w_ * xe + b_) - ye) ** 2;
  return {
    x: xe,
    y: ye,
    w,
    b,
    z,
    a,
    L,
    dL_da,
    da_dz,
    dL_dz,
    dL_dw,
    dL_db,
    num_w: central((w_) => perdaNeuronio(w_, b), w),
    num_b: central((b_) => perdaNeuronio(w, b_), b),
  };
}
