export default class ActualError extends Error {
  constructor(reason: string, public details: string[] = []) {
    super(reason);
    Object.setPrototypeOf(this, ActualError.prototype);
  }
}
