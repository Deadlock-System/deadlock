import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

type UserPayload = {
  userId: string;
  username: string;
};

interface RequestWithUser extends Request {
  user?: UserPayload;
}

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('Token de acesso inválido');
    }

    return userId;
  },
);
