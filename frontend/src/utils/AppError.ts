export class AppError extends Error {
  code: string;
  status?: number;
  details?: unknown;

  constructor(params: { code: string; status?: number; details?: unknown }) {
    super(params.code);
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
  }
}
