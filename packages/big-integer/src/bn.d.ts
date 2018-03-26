declare module 'bn.js' {
  export type BNValue = BN | number | string

  export default class BN {
    constructor(value: BNValue, base?: number)

    bitLength(): number

    clone(): BN
    toString(base?: number, length?: number): string
    toNumber(): number
    valueOf(): number
    toJSON(): string
    isZero(): boolean

    cmp(b: BN): number
    ucmp(b: BN): number
    cmpn(b: number): number

    lt(b: BN): BN
    ltn(b: number): BN

    lte(b: BN): BN
    lten(b: number): BN

    gt(b: BN): BN
    gtn(b: number): BN

    gte(b: BN): BN
    gten(b: number): BN

    eq(b: BN): BN
    eqn(b: number): BN

    neg(): BN
    ineg(): BN

    abs(): BN
    iabs(): BN

    add(b: BN): BN
    iadd(b: BN): BN
    addn(b: number): BN
    iaddn(b: number): BN

    sub(b: BN): BN
    isub(b: BN): BN
    subn(b: number): BN
    isubn(b: number): BN

    mul(b: BN): BN
    imul(b: BN): BN
    muln(b: number): BN
    imuln(b: number): BN

    div(b: BN): BN
    idiv(b: BN): BN
    divn(b: number): BN
    idivn(b: number): BN

    divRounded(b: BN): BN
    divmod(b: BN, mode?: ['mod', 'div'], positive?: boolean): {div: BN, mod: BN}

    mod(b: BN): BN
    umod(b: BN): BN
    modn(b: number): BN

    sqr(): BN
    isqr(): BN

    pow(b: BN): BN

    gcd(b: BN): BN
  }
}
