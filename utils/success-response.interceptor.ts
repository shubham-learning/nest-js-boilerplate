// // src/core/success-response.interceptor.ts
// import {
//   CallHandler,
//   ExecutionContext,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { SuccessResponse } from './api-response';

// @Injectable()
// export class SuccessResponseInterceptor<T>
//   implements NestInterceptor<T, SuccessResponse<T>>
// {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const ctx = context.switchToHttp();
//     const request = ctx.getRequest();

//     return next.handle().pipe(
//       map((data) => ({
//         success: true,
//         data: data?.result || data,
//         message: data?.message,
//         timestamp: new Date().toISOString(),
//         path: request.url,
//       })),
//     );
//   }
// }
