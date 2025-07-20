import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError } from 'rxjs';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(
      catchError((error) => {
        if (error.status >= 500) {
          console.error('Error 500 log => ', error);
          throw {
            statusCode: 500,
            message: 'Internal server error',
          };
        }

        throw error;
      }),
    );
  }
}
