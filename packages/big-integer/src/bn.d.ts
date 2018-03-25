declare module 'bn.js' {
  export type BNValue = BN | number | string

  export default class BN {
    constructor(value: BNValue, base?: number)

    clone(): BN
    toString(base?: number, length?: number): string
    toNumber(): number
    valueOf(): number
    toJSON(): string
    isZero(): boolean

    cmp(b: BNValue): number
    ucmp(b: BNValue): number
    cmpn(b: BNValue): number

    lt(b: BNValue): BN
    ltn(b: BNValue): BN

    lte(b: BNValue): BN
    lten(b: BNValue): BN

    gt(b: BNValue): BN
    gtn(b: BNValue): BN

    gte(b: BNValue): BN
    gten(b: BNValue): BN

    eq(b: BNValue): BN
    eqn(b: BNValue): BN

    neg(): BN
    ineg(): BN

    abs(): BN
    iabs(): BN

    add(b: BNValue): BN
    iadd(b: BNValue): BN
    addn(b: BNValue): BN
    iaddn(b: BNValue): BN

    sub(b: BNValue): BN
    isub(b: BNValue): BN
    subn(b: BNValue): BN
    isubn(b: BNValue): BN

    mul(b: BNValue): BN
    imul(b: BNValue): BN
    muln(b: BNValue): BN
    imuln(b: BNValue): BN

    div(b: BNValue): BN
    idiv(b: BNValue): BN
    divn(b: BNValue): BN
    idivn(b: BNValue): BN

    divRounded(b: BNValue): BN

    mod(b: BNValue): BN
    umod(b: BNValue): BN
    modn(b: BNValue): BN

    sqr(): BN
    isqr(): BN

    pow(b: BNValue): BN

    gcd(b: BNValue): BN
  }
}
