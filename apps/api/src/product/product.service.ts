import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductSort, QueryProductDto } from './dto/query-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return await this.prisma.product.create({
      data: {
        color_main_image: createProductDto.color_main_image,
        color_detail_image: createProductDto.color_detail_image,
        name: createProductDto.name,
        hash_tag: createProductDto.hash_tag,
        price: createProductDto.price,
        is_sale: createProductDto.is_sale ?? false,
        category_id: createProductDto.category_id,
        brand_id: createProductDto.brand_id,
      },
    });
  }

  async findAll(query: QueryProductDto) {
    const {
      page,
      limit,
      categoryId,
      sort = ProductSort.LATEST,
      productName,
    } = query;

    let orderBy: Prisma.ProductOrderByWithRelationInput;

    switch (sort) {
      case ProductSort.PRICE_ASC:
        orderBy = {
          price: 'asc',
        };
        break;

      case ProductSort.PRICE_DESC:
        orderBy = {
          price: 'desc',
        };
        break;

      case ProductSort.LATEST:
      default:
        orderBy = {
          id: 'desc',
        };
        break;
    }
    const where: Prisma.ProductWhereInput = {
      category_id: categoryId ? categoryId : undefined,
      name: productName
        ? { contains: productName, mode: 'insensitive' }
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          category: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  //상품 단일 조회
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        // 재고가 많은 순으로 정렬
        detail_color: {
          orderBy: {
            stock: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`상품을 찾을 수 없습니다.`);
    }

    return product;
  }
}
