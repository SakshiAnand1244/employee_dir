import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiErrorResponse, ApiPaginationMeta, ApiSuccessResponse } from '@/server/models/responses';
import { AppError, isAppError } from '@/server/models/errors';

export function toApiMeta(meta?: {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}): ApiPaginationMeta | undefined {
  if (!meta) {
    return undefined;
  }

  return {
    page: meta.page,
    size: meta.size,
    total: meta.total,
    total_pages: meta.totalPages,
  };
}

export function successResponse<T>(
  data: T,
  message: string,
  status = 200,
  meta?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  },
) {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta: toApiMeta(meta) } : {}),
  };

  return NextResponse.json(payload, { status });
}

export function errorResponse(
  message: string,
  status = 500,
  code = 'INTERNAL_SERVER_ERROR',
  details?: unknown,
) {
  const payload: ApiErrorResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details !== undefined ? { details } : {}),
    },
  };

  return NextResponse.json(payload, { status });
}

function sanitizeAppError(error: AppError) {
  if (error.statusCode >= 500) {
    console.error('Internal application error', error);
    return errorResponse('Internal server error', error.statusCode, error.code);
  }

  return errorResponse(error.message, error.statusCode, error.code, error.details);
}

export function fromError(error: unknown) {
  if (error instanceof ZodError) {
    return errorResponse('Validation failed', 400, 'VALIDATION_ERROR', error.flatten());
  }

  if (isAppError(error)) {
    return sanitizeAppError(error);
  }

  if (error instanceof Error) {
    console.error('Unhandled server error', error);
    return errorResponse('Internal server error');
  }

  console.error('Unhandled non-error rejection', error);
  return errorResponse('Internal server error');
}
