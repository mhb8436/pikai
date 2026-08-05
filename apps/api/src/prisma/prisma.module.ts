import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 앱 전역에서 다 쓸 수 있게
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
