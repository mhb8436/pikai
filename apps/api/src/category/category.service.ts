import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    if (!createCategoryDto.products?.length) {
      throw new Error('상품이 존재하지 않습니다.');
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        products: {
          connect: createCategoryDto.products.map((productId) => ({
            id: productId,
          })),
        },
      },
    });
  }

  findAll() {
    return this.prisma.category.findMany({});
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
