export class FetchError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.body = body;
    Object.setPrototypeOf(this, FetchError.prototype);
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}
