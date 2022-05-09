import murmurhash from 'murmurhash';

/**
 * Hybrid Unique Logical Clock (HULC) timestamp generator
 *
 * Globally-unique, monotonic timestamps are generated from the
 *    combination of the unreliable system time, a counter, and an
 *    identifier for the current node (instance, machine, process, etc.).
 *    These timestamps can accommodate clock stuttering (duplicate values),
 *    regression, and node differences within the configured maximum drift.
 *
 * In order to generate timestamps locally or for transmission to another
 *    node, use the send() method. For global causality, timestamps must
 *    be included in each message processed by the system. Whenever a
 *    message is received, its timestamp must be passed to the recv()
 *    method.
 *
 * Timestamps serialize into a 46-character collatable string
 *    example: 2015-04-24T22:23:42.123Z-1000-0123456789ABCDEF
 *    example: 2015-04-24T22:23:42.123Z-1000-A219E7A71CC18912
 *
 * The 64-bit hybrid clock is based on the HLC specification,
 * http://www.cse.buffalo.edu/tech-reports/2014-04.pdf
 */

interface State {
  millis: number;
  counter: number;
  node: string;
}
/**
 * timestamp instance class
 */
export default class Timestamp {
  private _state: State;

  constructor(millis, counter, node) {
    this._state = {
      millis: millis,
      counter: counter,
      node: node,
    };
  }

  valueOf() {
    return this.toString();
  }

  toString() {
    return [
      new Date(this.millis()).toISOString(),
      ('0000' + this.counter().toString(16).toUpperCase()).slice(-4),
      ('0000000000000000' + this.node()).slice(-16),
    ].join('-');
  }

  millis() {
    return this._state.millis;
  }

  counter() {
    return this._state.counter;
  }

  node() {
    return this._state.node;
  }

  hash() {
    return murmurhash.v3(this.toString());
  }

  static parse(timestamp) {
    if (typeof timestamp === 'string') {
      const parts = timestamp.split('-');
      if (parts && parts.length === 5) {
        const millis = Date.parse(parts.slice(0, 3).join('-')).valueOf();
        const counter = parseInt(parts[3], 16);
        const node = parts[4];
        if (!isNaN(millis) && !isNaN(counter)) return new Timestamp(millis, counter, node);
      }
    }
    return null;
  }
}
