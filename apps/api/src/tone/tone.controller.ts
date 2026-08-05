import { Controller, Get, Type, UseGuards } from '@nestjs/common';
import { ToneService } from './tone.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { type jwtPayloadType } from '@repo/common';

@Controller('tone')
export class ToneController {
  constructor(private readonly toneService: ToneService) {}

  // 로그인 안 해도 조회 가능
  @Get()
  @ApiOperation({ summary: '전체 베스트 상품' })
  findAll() {
    return this.toneService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원의 톤 별 베스트' })
  async findTone(@CurrentUser() user: jwtPayloadType) {
    if (!user) {
      throw new Error('유저 정보 없음');
    }

    return this.toneService.findAll(user.id);
  }
}
