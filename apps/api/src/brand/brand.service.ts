import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    if (!createBrandDto.products?.length) {
      throw new NotFoundException('상품이 존재하지 않습니다.');
    }

    return this.prisma.brand.create({
      data: {
        name: createBrandDto.name,
        products: {
          connect: createBrandDto.products.map((productId) => ({
            id: productId,
          })),
        },
      },
    });
  }

  findAll() {
    return this.prisma.brand.findMany({
      include: {
        products: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    return `This action updates a #${id} brand`;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
