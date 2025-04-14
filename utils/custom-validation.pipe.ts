// const errors: ErrorResponse[] = [];

// validationErrors.forEach((error) => {
//   if (error.constraints) {
//     Object.values(error.constraints).forEach((errMessage) => {
//       errors.push({ name: error.property, message: errMessage });
//     });
//   }
// });

// import {
//   ValidationPipe,
//   BadRequestException,
//   ValidationError,
// } from '@nestjs/common';

// interface ErrorResponse {
//   name?: string;
//   message?: string | string[] | object;
// }

// const customValidationPipe = new ValidationPipe({
//   exceptionFactory: (validationErrors: ValidationError[] = []) => {
//     const errors: ErrorResponse[] = validationErrors.length
//       ? validationErrors.reduce<Array<ErrorResponse>>((acc, error) => {
//           if (error.constraints) {
//             Object.values(error.constraints).forEach((errMsg) =>
//               acc.push({ name: error.property, message: errMsg }),
//             );
//           }
//           return acc;
//         }, [])
//       : [
//           {
//             name: 'error',
//             message: 'Invalid parameter or transformation error',
//           },
//         ];

//     return new BadRequestException(errors);
//   },
// });

// export default customValidationPipe;

import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';

interface ErrorResponse {
  name?: string;
  message?: string | string[] | object;
}

const customValidationPipe = new ValidationPipe({
  transform: true, // Enable transformation of incoming data
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    const errors: ErrorResponse[] = [];

    // Recursive function to flatten nested validation errors
    const flattenErrors = (error: ValidationError, parentPath: string = '') => {
      const currentPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        Object.values(error.constraints).forEach((message) => {
          errors.push({ name: currentPath, message });
        });
      }

      if (error.children?.length) {
        error.children.forEach((child) => flattenErrors(child, currentPath));
      }
    };

    validationErrors.forEach((error) => flattenErrors(error));

    if (errors.length === 0) {
      errors.push({
        name: 'error',
        message: 'Invalid parameter or transformation error',
      });
    }

    return new BadRequestException(errors);
  },
});

export default customValidationPipe;
