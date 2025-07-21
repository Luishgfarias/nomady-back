import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER } from '../constants/request-constants';
import { Request } from 'express';

export const UserToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const req: Request = context.getRequest();
    return req[REQUEST_USER];
  },
);
