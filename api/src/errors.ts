import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({ error: error.message });
  }
  if (error instanceof ZodError) {
    return reply.code(400).send({ error: 'Validation failed', details: error.issues });
  }
  request.log.error(error);
  return reply.code(500).send({ error: 'Internal server error' });
}
