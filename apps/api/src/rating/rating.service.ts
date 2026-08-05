import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryDto } from '../common/query.dto';
import { DeleteRatingDto } from './dto/delete-rating.dto';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createRatingDto: CreateRatingDto, userId: number) {
    // 이미 등록된 별점인지 와 상품과 유저가 있는 지 확인
    const [existRating, detail_color, user] = await Promise.all([
      this.prisma.rating.findUnique({
        where: {
          detail_color_id_user_id: {
            detail_color_id: createRatingDto.detail_color_id,
            user_id: userId,
          },
        },
      }),
      this.prisma.detailProduct.findUnique({
        where: { id: createRatingDto.detail_color_id },
      }),
      this.prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (existRating) {
      throw new ConflictException(`해당 제품의 별점이 이미 존재합니다.}`);
    }

    if (!detail_color && !createRatingDto.is_hsl) {
      throw new NotFoundException(
        `${createRatingDto.detail_color_id}은 존재 하지 않은 제품 컬러입니다.`,
      );
    }
    if (!user) {
      throw new NotFoundException(`${userId}는 존재하지 않는 유저입니다.`);
    }
    if (createRatingDto.is_comp) {
      await this.getCompRatingCount(userId);
    }

    return this.prisma.rating.create({
      data: { ...createRatingDto, user_id: userId },
    });
  }

  async getUserRatings(query: QueryDto, userId: number) {
    const { page, limit } = query;

    // 사용자가 있는지 체크
    const existUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existUser) {
      throw new NotFoundException(`[${userId}] 유저가 없습니다.`);
    }

    const [rating, total] = await Promise.all([
      this.prisma.rating.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { user_id: userId },
        include: {
          detail_color: {
            select: {
              color_name: true,
              color_image: true,
              h: true,
              s: true,
              l: true,
              products: {
                select: {
                  name: true,
                  color_main_image: true,
                },
              },
            },
          },
        },
        orderBy: {
          // true = 1, false = 0
          // true가 크므로 맨 위로 정렬
          is_comp: 'desc',
        },
      }),
      this.prisma.rating.count({
        where: {
          user_id: userId,
        },
      }),
    ]);

    return {
      rating,
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    };
  }

  async getCompRatings(userId: number) {
    // user 확인
    const existUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existUser) {
      throw new NotFoundException(`[${userId}]가 없어요`);
    }
    const compRatings = await this.prisma.rating.findMany({
      where: {
        user_id: userId,
        is_comp: true,
      },
      include: {
        detail_color: {
          select: {
            color_name: true,
            color_image: true,
            h: true,
            s: true,
            l: true,
            products: {
              select: {
                name: true,
                color_main_image: true,
              },
            },
          },
        },
      },
    });

    if (!compRatings) {
      throw new NotFoundException(
        `[${userId}]가 가진 별점 비교 데이터가 없습니다.`,
      );
    }

    return compRatings;
  }

  async getCompRating(id: number) {
    const compRatings = await this.prisma.rating.findFirst({
      where: {
        id,
        is_comp: true,
      },
      include: {
        detail_color: {
          select: {
            color_name: true,
            color_image: true,
            h: true,
            s: true,
            l: true,
            products: {
              select: {
                name: true,
                color_main_image: true,
              },
            },
          },
        },
      },
    });

    if (!compRatings) {
      throw new NotFoundException(`[${id}] 별점 비교 데이터가 없습니다.`);
    }

    return compRatings;
  }

  async findOne(id: number, userId: number) {
    const [existRating, compRatingNum] = await Promise.all([
      this.prisma.rating.findUnique({
        where: { id, user_id: userId },
        include: {
          detail_color: {
            select: {
              color_name: true,
              color_image: true,
              products: {
                select: {
                  name: true,
                  color_main_image: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.rating.count({
        where: {
          user_id: userId,
          is_comp: true,
        },
      }),
    ]);

    if (!existRating) {
      throw new NotFoundException(`[${id}] 해당 별점이 존재하지 않아요`);
    }
    return { existRating, compRatingNum };
  }

  async getCompRatingCount(userId: number) {
    const ratingCount = await this.prisma.rating.count({
      where: { is_comp: true, user_id: userId },
    });

    if (ratingCount >= 10) {
      throw new BadRequestException(
        `비교 상품 등록 최대 갯수(10개)를 초과했습니다.`,
      );
    }
    return { ratingCount };
  }

  async update(id: number, updateRatingDto: UpdateRatingDto, userId: number) {
    // 컬러 제품이 있는 지 확인
    const { compRatingNum } = await this.findOne(id, userId);
    // 비교 제품이 10개 이상인 경우 추가 못하게 설정
    if (updateRatingDto.is_comp === true) {
      if (compRatingNum >= 10) {
        throw new BadRequestException(
          `비교 상품 등록 최대 갯수(10개)를 초과했습니다.`,
        );
      }
    }

    return this.prisma.rating.update({
      where: { id },
      data: updateRatingDto,
    });
  }

  async remove(deleteDto: DeleteRatingDto, userId: number) {
    const { ids } = deleteDto;
    // 컬러 제품이 있는 지 확인
    await Promise.all(ids.map((id) => this.findOne(id, userId)));

    await this.prisma.rating.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return { del: ids };
  }
}
