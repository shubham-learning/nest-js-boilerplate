// // src/core/global-exception.filter.ts
// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
// } from '@nestjs/common';
// import { Request, Response } from 'express';
// import { ErrorResponse, ErrorCode } from './api-response';

// @Catch()
// export class GlobalExceptionFilter implements ExceptionFilter {
//   catch(exception: any, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();

//     let status = 500;
//     let errorCode = ErrorCode.INTERNAL_ERROR;
//     let message = 'Internal server error';
//     let details: { field?: string; message: string }[] = [];

//     if (exception instanceof HttpException) {
//       status = exception.getStatus();
//       const exceptionResponse = exception.getResponse();

//       if (status === 400) {
//         if (this.isValidationError(exceptionResponse)) {
//           errorCode = ErrorCode.VALIDATION_ERROR;
//           message = 'Validation failed';
//           details = this.formatValidationErrors(exceptionResponse);
//         } else {
//           errorCode = ErrorCode.BAD_REQUEST;
//           message = this.getExceptionMessage(exceptionResponse);
//         }
//       } else {
//         message = this.getExceptionMessage(exceptionResponse);
//         errorCode = this.getErrorCode(status);
//       }
//     } else {
//       // Log internal server errors for debugging
//       console.error(exception);
//     }

//     const errorResponse: ErrorResponse = {
//       success: false,
//       error: {
//         code: errorCode,
//         message,
//         ...(details.length > 0 && { details }),
//       },
//       timestamp: new Date().toISOString(),
//       path: request.url,
//     };

//     response.status(status).json(errorResponse);
//   }

//   private isValidationError(response: any): boolean {
//     return (
//       Array.isArray(response.message) &&
//       response.message.every(
//         (error: any) =>
//           error.property &&
//           error.constraints &&
//           typeof error.constraints === 'object',
//       )
//     );
//   }

//   private formatValidationErrors(response: any) {
//     const details = [];
//     if (Array.isArray(response.message)) {
//       response.message.forEach((error: any) => {
//         const field = error.property;
//         const constraints = error.constraints || {};
//         Object.values(constraints).forEach((message: string) => {
//           details.push({ field, message });
//         });
//       });
//     } else {
//       details.push({ message: response.message });
//     }
//     return details;
//   }

//   private getExceptionMessage(response: string | object): string {
//     if (typeof response === 'string') return response;
//     if (typeof response === 'object' && 'message' in response) {
//       return Array.isArray(response.message)
//         ? response.message[0]
//         : response.message;
//     }
//     return 'Internal server error';
//   }

//   private getErrorCode(status: number): string {
//     switch (status) {
//       case 400:
//         return ErrorCode.BAD_REQUEST;
//       case 401:
//         return ErrorCode.UNAUTHORIZED;
//       case 403:
//         return ErrorCode.FORBIDDEN;
//       case 404:
//         return ErrorCode.NOT_FOUND;
//       case 405:
//         return ErrorCode.METHOD_NOT_ALLOWED;
//       case 409:
//         return ErrorCode.CONFLICT;
//       default:
//         return ErrorCode.INTERNAL_ERROR;
//     }
//   }
// }
