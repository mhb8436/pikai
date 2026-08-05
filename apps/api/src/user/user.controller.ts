import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';

@Controller('user')
@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '사용자 본인의 상세 정보 조회' })
  findOne(@CurrentUser('id') userId: number) {
    return this.userService.findOne(userId);
  }

  @Patch()
  @ApiOperation({
    summary: '사용자 본인의 정보 수정(주소,사용 여부,퍼스널 컬러 등)',
  })
  update(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.userService.update(updateUserDto, userId);
  }
}
