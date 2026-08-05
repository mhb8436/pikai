import { ForbiddenException } from '@nestjs/common';

export function checkPermissionRole(isAdmin: boolean) {
  if (!isAdmin) {
    throw new ForbiddenException('권한이 없습니다.');
  }
}

// 관리자 여부 체크와 id가 본인(userid)와 같은지 확인
export function checkPermission(isAdmin: boolean, userid: number, id: number) {
  if (!isAdmin && userid !== id) {
    throw new ForbiddenException('권한이 없습니다.');
  }
}

export function checkPermissionId(id: number, userId: number) {
  if (id !== userId) {
    throw new ForbiddenException('권한이 없습니다.');
  }
}
