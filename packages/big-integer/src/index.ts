/// <reference path="./bn" />
import BigInteger from 'bn.js'

export type BigIntegerValue = BigInteger | number | string

BigInteger.prototype.valueOf = function(): number {
  return this.toNumber()
}

export { BigInteger, BigInteger as default }
