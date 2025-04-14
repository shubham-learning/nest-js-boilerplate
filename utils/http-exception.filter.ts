import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface Errors {
  name: string;
  message: string;
  description?: any;
}

interface ErrorResponse {
  statusCode: number;
  errors: Array<{ name: string; message: string; description?: string }>;
  timestamp: string;
  path: string;
}

interface HttpExceptionResponse {
  message?: string | string[] | object;
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (this.isHttpExceptionResponse(exceptionResponse)) {
        message = this.hasMessage(exceptionResponse)
          ? exceptionResponse.message
          : exceptionResponse;
      } else {
        message = exceptionResponse;
      }

      stack = exception.stack;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = {
        name: 'database-error',
        message: exception.message,
      };

      stack = exception.stack;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    } else {
      message = String(exception);
    }

    this.logError(request, status, message, stack);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      errors: this.normalizeMessage(message),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private isHttpExceptionResponse(
    response: unknown,
  ): response is HttpExceptionResponse {
    return typeof response === 'object' && response !== null;
  }

  private hasMessage(
    response: object,
  ): response is { message: string | string[] | object } {
    return 'message' in response;
  }

  private normalizeMessage(message: string | object): Array<Errors> {
    const errors: Array<Errors> = [];

    const processErrorObject = (obj: Record<string, unknown>) => {
      if (Array.isArray(obj.errors)) {
        obj.errors.forEach((error) => processUnknownError(error));
      } else if (
        typeof obj.name === 'string' &&
        typeof obj.message === 'string'
      ) {
        errors.push({
          name: obj.name,
          message: obj.message,
          description: obj?.description,
        });
      } else {
        errors.push({ name: 'error', message: JSON.stringify(obj) });
      }
    };

    // 2. Main processor function (defined last)
    const processUnknownError = (error: unknown) => {
      if (typeof error === 'string') {
        errors.push({ name: 'error', message: error });
      } else if (Array.isArray(error)) {
        error.forEach((item) => processUnknownError(item));
      } else if (error && typeof error === 'object') {
        processErrorObject(error as Record<string, unknown>);
      } else {
        errors.push({ name: 'error', message: String(error) });
      }
    };

    // 3. Start processing
    processUnknownError(message);

    return errors.length > 0
      ? errors
      : [{ name: 'error', message: 'Unknown error' }];
  }

  private logError(
    request: Request,
    status: number,
    message: string | object,
    stack?: string,
    exception?: object,
  ) {
    const logMessage = `Error: ${
      typeof message === 'object' ? JSON.stringify(message) : message
    } \n ${request.method} ${request.url} \n Status: ${status}`;

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(logMessage, stack, HttpExceptionFilter.name);
    } else {
      this.logger.warn(logMessage, exception);
    }
  }
}
