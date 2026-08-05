import { Injectable } from '@nestjs/common';
import { PersonalColor } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const Tone: Record<string, string> = {
  WARM: '웜',
  COOL: '쿨',
  SPRINGWARM: '봄 웜',
  SUMMERCOOL: '여름 쿨',
  SUMMERMUTE: '여름 뮤트',
  FALLWARM: '가을 웜톤',
  FALLMUTE: '가을 뮤트',
  FALLDEEP: '가을 딥',
  WINTERCOOL: '겨울 쿨',
  WINTERDEEP: '겨울 딥',
};

@Injectable()
export class ToneService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: number) {
    let tone: PersonalColor | undefined;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          personal_color: true,
        },
      });
      tone = user?.personal_color;
    }

    let products = await this.prisma.sale.findMany({
      where: tone
        ? {
            [tone]: {
              gt: 0,
            },
          }
        : {},
      include: {
        detailColor: {
          include: {
            products: true,
          },
        },
      },
      orderBy: tone
        ? {
            [tone]: 'desc',
          }
        : {
            sale_count: 'desc',
          },
      take: 6,
    });

    if (tone && (products.length === 0 || !products[0][tone])) {
      tone = undefined;

      products = await this.prisma.sale.findMany({
        include: {
          detailColor: {
            include: {
              products: true,
            },
          },
        },
        orderBy: {
          sale_count: 'desc',
        },
        take: 6,
      });
    }

    const toneName = tone ? Tone[tone] || tone : null;

    return {
      products,
      title: toneName ? `${toneName}톤 베스트 상품` : '베스트 상품',
    };
  }
}
