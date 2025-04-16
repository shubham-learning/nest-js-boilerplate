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
  description?: string;
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
    let errorsDetails: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (this.isHttpExceptionResponse(exceptionResponse)) {
        errorsDetails = this.hasMessage(exceptionResponse)
          ? exceptionResponse.message
          : exceptionResponse;
      } else {
        errorsDetails = exceptionResponse;
      }
    } else if (exception instanceof QueryFailedError) {
      errorsDetails = {
        name: 'database-error',
        message: exception.message,
        description: (exception.driverError as { detail?: string })?.detail,
      };
    } else if (exception instanceof Error) {
      errorsDetails = exception.message;
    } else {
      errorsDetails = String(exception);
    }

    this.logError(request, status, errorsDetails, exception);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      errors:
        status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? [
              {
                name: 'unexpected-server-error',
                message: 'Something Went Wrong. Please try after some times',
                description:
                  'Please contact administrator and present correlation identifier for troubleshooting',
              },
            ]
          : this.normalizeMessage(errorsDetails),
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

    const isErrorObject = (
      obj: unknown,
    ): obj is { name: string; message: string; description?: unknown } =>
      typeof obj === 'object' &&
      obj !== null &&
      'name' in obj &&
      'message' in obj;

    const processError = (error: unknown): void => {
      switch (true) {
        case typeof error === 'string':
          errors.push({ name: 'error', message: error });
          break;

        case Array.isArray(error):
          error.forEach((item) => processError(item));
          break;

        case isErrorObject(error):
          errors.push({
            name: error.name,
            message: error.message,
            description:
              typeof error.description === 'string'
                ? error.description
                : undefined,
          });
          break;

        case error instanceof Error:
          errors.push({
            name: error.name || 'error',
            message: error.message,
          });
          break;

        default:
          errors.push({
            name: 'error',
            message: JSON.stringify(error, (_, value) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              value instanceof Error ? value.stack : value,
            ),
          });
      }
    };

    processError(message);

    return errors.length > 0
      ? errors
      : [{ name: 'error', message: 'Unknown error' }];
  }

  private logError(
    request: Request,
    status: number,
    errors: string | object,
    exception?: any,
  ) {
    let message: string;
    let stack: string | undefined;

    if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    } else {
      message = String(exception);
      stack = 'No stack trace available';
    }

    const logMessage = `
    Status: ${status} \n 
    Error: ${typeof errors === 'object' ? JSON.stringify(errors) : errors} \n 
    Request: ${request.method} ${request.url} \n 
    Message: ${message} \n`;

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(logMessage, stack, HttpExceptionFilter.name);
    } else if (status >= 400 && status < 500) {
      this.logger.warn(logMessage);
    } else {
      this.logger.warn(logMessage, stack, exception);
    }
  }
}
