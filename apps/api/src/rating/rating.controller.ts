import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingEntity } from './entities/rating.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Rating } from '@prisma/client';
import { QueryDto } from '../common/query.dto';
import { DeleteRatingDto } from './dto/delete-rating.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';

@Controller('rating')
@ApiTags('Rating')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @ApiOperation({ summary: '제품에 대한 별점 추가' })
  @ApiResponse({ type: RatingEntity })
  async create(
    @Body() createRatingDto: CreateRatingDto,
    @CurrentUser('id') userId: number,
  ) {
    const create_rating: Rating = await this.ratingService.create(
      createRatingDto,
      userId,
    );
    return new RatingEntity(create_rating);
  }

  @Get()
  @ApiOperation({ summary: '사용자 별 사용자가 작성한 모든 별점 찾기' })
  getUserRatings(@Query() query: QueryDto, @CurrentUser('id') userId: number) {
    return this.ratingService.getUserRatings(query, userId);
  }

  @Get('/comp')
  @ApiOperation({ summary: '비교 제품들 가져오기' })
  getCompRatings(@CurrentUser('id') userId: number) {
    return this.ratingService.getCompRatings(userId);
  }

  @Get('/comp/count')
  @ApiOperation({ summary: '사용자 별 비교 제품 수 가져오기' })
  getCompRatingCount(@CurrentUser('id') userId: number) {
    return this.ratingService.getCompRatingCount(userId);
  }

  @Get('/comp/:id')
  @ApiOperation({ summary: '비교 제품 가져오기' })
  getCompRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingService.getCompRating(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '별점 하나 가져오기' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.ratingService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '별점 하나 수정하기 (비교 제품 여부와 별점 수정)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.ratingService.update(id, updateRatingDto, userId);
  }

  @Delete()
  @ApiOperation({ summary: '별점 상품 삭제하기' })
  remove(@Query() query: DeleteRatingDto, @CurrentUser('id') userId: number) {
    return this.ratingService.remove(query, userId);
  }
}
