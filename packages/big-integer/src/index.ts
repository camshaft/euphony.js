/// <reference path="./js-integer" />
import {
  DEFAULT_DISPLAY_BASE,
  DEFAULT_REPRESENTATION_BASE as BASE,
  ZeroDivisionError
} from '@aureooms/js-integer'
import {
  _alloc, _cmp, _copy,
  _euclidean_algorithm, _idivmod,
  _increment,
  _jz, _powd, _sub as _isub,
  _trim_positive, _zeros, add, convert,
  mul, parse,
  stringify
} from '@aureooms/js-integer-big-endian'

export type BigIntegerValue = BigInteger | number | string

const MAX_INT = 0x20000000000000

function _trim_zeros (a: number[]): void {
  for (let i = 0, l = a.length - 1; i < l; i++) {
    if (a[0] === 0) a.shift()
    else break
  }
}

function _iadd (m: BigInteger, other: BigInteger): void {
  other.n = m.n
  const a = m.l
  const b = other.l
  const c = other.l = _zeros(Math.max(a.length, b.length) + 1)

  add(BASE, a, 0, a.length, b, 0, b.length, c, 0, c.length)

  _trim_zeros(c)
}

function _sub (m: BigInteger, other: BigInteger): BigInteger {
  const a = m.l
  const aj = a.length
  const ai = _trim_positive(a, 0, aj)

  if (ai >= aj) return other.neg()

  const b = other.l
  const bj = b.length
  const bi = _trim_positive(b, 0, bj)

  if (bi >= bj) return m

  if (_cmp(a, ai, aj, b, bi, bj) < 0) {
    const c = other.l = _zeros(bj - bi)
    _isub(BASE, b, bi, bj, a, ai, aj, c, 0, c.length)
    other.n = !m.n
  } else {
    const c = other.l = _zeros(aj - ai)
    _isub(BASE, a, ai, aj, b, bi, bj, c, 0, c.length)
    other.n = m.n
  }

  return other
}

export default class BigInteger {
  public n: boolean
  public l: number[]

  constructor (n: BigIntegerValue) {
    if (n === 0) {
      this.n = false
      this.l = [0]
    } else if (n instanceof BigInteger) {
      this.n = n.n
      this.l = n.l.slice()
    } else if (typeof n === 'string' && n) {
      if (this.n = n.charAt(0) === '-') { // tslint:disable-line
        n = n.slice(1)
      }
      if (n.charAt(0) === '+') n = n.slice(1)

      this.l = parse(10, BASE, n)
    } else if (typeof n === 'number') {
      if (this.n = n < 0) { // tslint:disable-line
        n = -n
      }

      this.l = convert(MAX_INT, BASE, [n], 0, 1)
    } else {
      throw new Error(`Invalid value ${n}`)
    }
  }

  public neg (): BigInteger {
    const n: BigInteger = new (this.constructor as any)(this)
    n.n = !n.n
    return n
  }

  public add (value: BigIntegerValue): BigInteger {
    const other = new (this.constructor as any)(value)

    if (this.n !== other.n) {
      if (other.n) {
        other.n = !other.n
        return _sub(this, other)
      } else {
        const n = this.neg()
        return _sub(other, n)
      }
    }

    _iadd(this, other)

    return other
  }

  public sub (value: BigIntegerValue): BigInteger {
    const other = new (this.constructor as any)(value)

    if (this.n !== other.n) {
      if (other.n) {
        other.n = !other.n
        _iadd(this, other)
        return other
      } else {
        let n = this.neg()
        _iadd(other, n)
        n.n = !n.n
        return n
      }
    }

    return _sub(this, other)
  }

  public mul (value: BigIntegerValue): BigInteger {
    const other = new (this.constructor as any)(value)

    const { n: an, l: a } = this
    const { n: bn, l: b } = other
    other.n = an !== bn
    const c = other.l = _zeros(a.length + b.length)

    mul(BASE, a, 0, a.length, b, 0, b.length, c, 0, c.length)

    _trim_zeros(c)

    return other
  }

  public div (value: BigIntegerValue): BigInteger {
    return this.divmod(value)[0]
  }

  public mod (value: BigIntegerValue): BigInteger {
    return this.divmod(value)[1]
  }

  public divmod (value: BigIntegerValue): BigInteger[] {
    const other = new (this.constructor as any)(value)

    if (other.iszero()) throw new ZeroDivisionError('Integer division by zero')  // optimize

    // The underlying algorithm does not allow leading 0's so we trim them.
    const lj = this.l.length
    const li = _trim_positive(this.l, 0, lj)

    // Dividend is 0
    if (li >= lj) {
      other.l = [0]
      return [
        other,
        other
      ]
    }

    // Dividend (& Remainder)
    let R = new (this.constructor as any)(0)
    R.l = this.l.slice()

    const D = R.l = _alloc(lj - li)
    _copy(this.l, li, lj, D, 0)

    // Divisor
    const d = other.l
    const dj = d.length
    const di = _trim_positive(d, 0, dj)  // di < dj because d != 0

    // Quotient
    const otherIsNegative = other.n
    const Q = other
    const q = other.l = _zeros(D.length)
    other.n = this.n !== other.n

    _idivmod(BASE, D, 0, D.length, d, di, dj, q, 0, q.length)

    if ((this.n || otherIsNegative) && !_jz(D, 0, D.length)) {
      if (otherIsNegative) {
        if (!this.n) {
          _increment(BASE, q, 0, q.length)
          R = R.add(other)  // TODO optimize
        } else {
          R = R.neg() // TODO optimize
        }
      } else {
        _increment(BASE, q, 0, q.length)
        R = R.neg().add(other)  // TODO optimize
      }
    }

    return [Q, R]
  }

  public pow (x: number): BigInteger {
    const a = this.l
    const res = new (this.constructor as any)(0)
    const c = res.l = _zeros(Math.max(1, a.length * x))

    _powd(BASE, x, a, 0, c, 0, c.length)

    return res
  }

  public gcd (value: BigIntegerValue): BigInteger {
    const { constructor } = this
    let a = new (constructor as any)(this)
    let b = new (constructor as any)(value)

    const cmp = a.cmp(b)

    if (cmp === 0) {
      return a
    } else if (a.cmp(b) < 0) { // assert A >= B
      const tmp = a
      a = b
      b = tmp
    }

    // The underlying algorithm does not allow leading 0's so we trim them.
    const al = a.l
    const aj = al.length
    const ai = _trim_positive(al, 0, aj)
    // a is 0
    if (ai >= aj) return b

    const bl = b.l
    const bj = bl.length
    const bi = _trim_positive(bl, 0, bj)
    // b is 0
    if (bi >= bj) return a

    const res = _euclidean_algorithm(
      BASE,
      al,
      ai,
      aj,
      bl,
      bi,
      bj
    )

    a.l = res[0].slice(res[1], res[2])
    a.n = false

    return a
  }

  public cmp (value: BigIntegerValue): number {
    const other = new (this.constructor as any)(value)

    if (this.iszero()) {
      if (other.iszero()) return 0
      else return other.n ? 1 : -1
    }

    if (this.n !== other.n) return this.n ? -1 : 1

    const a = this.l
    const b = other.l

    return _cmp(a, 0, a.length, b, 0, b.length)
  }

  public iszero (): boolean {
    return _jz(this.l, 0, this.l.length)
  }

  public eq (n: BigIntegerValue): boolean {
    return this.cmp(n) === 0
  }

  public ne (n: BigIntegerValue): boolean {
    return this.cmp(n) !== 0
  }

  public gt (n: BigIntegerValue): boolean {
    return this.cmp(n) > 0
  }

  public gte (n: BigIntegerValue): boolean {
    return this.cmp(n) > -1
  }

  public lt (n: BigIntegerValue): boolean {
    return this.cmp(n) < 0
  }

  public lte (n: BigIntegerValue): boolean {
    return this.cmp(n) < 1
  }

  public valueOf (): number {
    return +this.toString()
  }

  public toString (base = DEFAULT_DISPLAY_BASE): string {
    if (this.iszero()) return '0'

    const digits = stringify(BASE, base, this.l, 0, this.l.length)

    return this.n ? `-${digits}` : digits
  }
}

export { BigInteger }
