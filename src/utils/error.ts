export class ErrorResponse extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ErrorResponse';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error: unknown): ErrorResponse => {
  if (error instanceof ErrorResponse) {
    return error;
  }

  if (error instanceof Error) {
    return new ErrorResponse(error.message);
  }

  return new ErrorResponse('An unexpected error occurred');
}; 