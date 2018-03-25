import { BigInteger, BigIntegerValue } from '@euphony/big-integer'

export type RationalValue = Rational | [BigIntegerValue, BigIntegerValue] | BigIntegerValue

const one = new BigInteger(1)

export default class Rational {
  public n: BigInteger
  public d: BigInteger
  private _simplify: boolean = true

  constructor (value: RationalValue, simplify = true) {
    if (value instanceof Rational) {
      this.n = value.n
      this.d = value.d
      this._simplify = value._simplify
      if (simplify && !this._simplify) this.simplify(simplify)
    } else if (Array.isArray(value)) {
      this.n = new BigInteger(value[0])
      this.d = new BigInteger(value[1])
      this.simplify(simplify)
    } else {
      this.n = new BigInteger(value)
      this.d = one
      this._simplify = simplify
    }
  }

  public add (value: RationalValue): Rational {
    const other = new (this.constructor as any)(value, false)

    const { n, d } = other
    if (this.d.eq(d)) {
      other.n = this.n.add(n)
    } else {
      const x = this.n.mul(d)
      const y = n.mul(this.d)
      other.n = x.iadd(y)
      other.d = this.d.mul(d)
    }

    return other.simplify(this._simplify)
  }

  public div (value: RationalValue): Rational {
    if (this.n.isZero()) return this

    const other = new (this.constructor as any)(value, false)

    const { n, d } = other
    other.n = this.n.mul(d)
    other.d = this.d.mul(n)

    return other.simplify(this._simplify)
  }

  public divmod (value?: RationalValue): { div: Rational, mod: Rational } {
    const { n, d } = value === undefined ? this : this.div(value)

    const { div, mod } = n.divmod(d)

    return {
      div: new (this.constructor as any)(div, false),
      mod: new (this.constructor as any)([mod, d], false)
    }
  }

  public mul (value: RationalValue): Rational {
    if (this.n.isZero()) return this

    const other = new (this.constructor as any)(value, false)

    const { n, d } = other
    other.n = this.n.mul(n)
    other.d = this.d.mul(d)

    return other.simplify(this._simplify)
  }

  public sub (value: RationalValue): Rational {
    const other = new (this.constructor as any)(value, false)

    const { n, d } = other
    if (this.d.eq(d)) {
      other.n = this.n.sub(n)
    } else {
      const x = this.n.mul(d)
      const y = n.mul(this.d)
      other.n = x.isub(y)
      other.d = this.d.mul(d)
    }

    return other.simplify(this._simplify)
  }

  public neg (): Rational {
    const n: Rational = new (this.constructor as any)(this, false)
    n.n = n.n.neg()
    return n
  }

  public cmp (value: RationalValue): number {
    const other = new (this.constructor as any)(value, false)

    const x = this.n.mul(other.d)
    const y = this.d.mul(other.n)

    return x.cmp(y)
  }

  public floor (): Rational {
    const {
      n,
      d,
      _simplify,
      constructor
    } = this
    return new (constructor as any)(n.div(d), _simplify)
  }

  public simplify (enable?: boolean): Rational {
    if (enable === true || enable === false) {
      this._simplify = enable
    }
    const { n, d } = this

    if (this.n.isZero()) {
      this.d = one
      return this
    }

    if (this._simplify === false || this.d.eq(one)) return this

    const gcdiv = n.gcd(d)

    this.d = d.div(gcdiv)
    this.n = n.div(gcdiv)

    return this
  }

  public valueOf (): number {
    return this.n.valueOf() / this.d.valueOf()
  }

  public toString (): string {
    return `${this.n}/${this.d}`
  }

  public toBigInteger(): BigInteger {
    return this.n.div(this.d)
  }

  // public inspect() {
  //   return `<${this.constructor.name} ${this.toString()}>`
  // }
}

export { Rational }
