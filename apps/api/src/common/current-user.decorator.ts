import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PersonalColor } from '@prisma/client';

export interface AuthUser {
  id: number;
  email: string;
  isAdmin: boolean;
  tone: PersonalColor;
}

export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    // field가 있으면 한 필드만 없으면 객체 전체 반환
    // @CurrentUser("id") => user.id
    // @CurrentUser() => user (전체)
    return field ? user?.[field] : user;
  },
);
