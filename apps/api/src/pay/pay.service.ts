import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePayDto } from './dto/create-pay.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BuyItem, PayItemType } from './pay.type';

@Injectable()
export class PayService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateOrderId(): Promise<string> {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const date = `${year}${month}${day}`;

    //주문번호 생성
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        id: {
          startsWith: date,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
    let sequence = 1;

    if (lastOrder) {
      sequence = Number(lastOrder.id.slice(-4)) + 1;
    }

    return `${date}${String(sequence).padStart(4, '0')}`;
  }

  // 상품 가격(할인가)
  private getSalePrice(price: number): number {
    return Math.floor(price * 0.9);
  }

  async create(userId: number, createPayDto: CreatePayDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('회원을 찾을 수 없습니다.');
    }

    if (!user.is_active) {
      throw new BadRequestException('탈퇴한 회원입니다.');
    }

    const orderId = await this.generateOrderId();

    return await this.prisma.$transaction(async (tx) => {
      if (createPayDto.items.length === 0) {
        throw new BadRequestException('주문 상품이 없습니다.');
      }

      //상품 확인
      for (const item of createPayDto.items) {
        const product = await tx.detailProduct.findUnique({
          where: {
            id: item.detail_color_id,
          },
          include: {
            products: true,
          },
        });
        if (!product) {
          throw new NotFoundException('상품을 찾을 수 없습니다.');
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `${product.color_name}의 재고가 부족합니다.`,
          );
        }
      }

      const order = await tx.order.create({
        data: {
          id: orderId,
          payment: createPayDto.payment,
          delivery_info: createPayDto.delivery_info,
          postal_code: createPayDto.postal_code,
          delivery_inst: createPayDto.delivery_inst,
          phone_number: createPayDto.phone_number,
          recipient: createPayDto.recipient,
          user_id: userId,
        },
      });

      for (const item of createPayDto.items) {
        const product = await tx.detailProduct.findUnique({
          where: {
            id: item.detail_color_id,
          },
          include: {
            products: true,
          },
        });

        if (!product) {
          throw new NotFoundException('상품을 찾을 수 없습니다.');
        }

        await tx.orderItem.create({
          data: {
            order_id: order.id,
            detail_color_id: item.detail_color_id,
            quantity: item.quantity,
            price: this.getSalePrice(product.products.price),
          },
        });

        //재고 감소
        await tx.detailProduct.update({
          where: {
            id: item.detail_color_id,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      const cart = await tx.cart.findUnique({
        where: {
          userId,
        },
      });

      if (!cart) {
        throw new NotFoundException('장바구니를 찾을 수 없습니다.');
      }

      //장바구니, 바로구매에 맞게 결제 후 제품 삭제
      if (!createPayDto.isCartOrder) {
        await tx.cartItem.deleteMany({
          where: {
            cart_id: cart.id,
            is_now: true,
            detail_color_id: {
              in: createPayDto.items.map((item) => item.detail_color_id),
            },
          },
        });
      } else if (createPayDto.selectedOnly) {
        await tx.cartItem.deleteMany({
          where: {
            cart_id: cart.id,
            detail_color_id: {
              in: createPayDto.items.map((item) => item.detail_color_id),
            },
          },
        });
      } else {
        await tx.cartItem.deleteMany({
          where: {
            cart_id: cart.id,
            is_now: false,
            detail_color_id: {
              in: createPayDto.items.map((item) => item.detail_color_id),
            },
          },
        });
      }

      return order;
    });
  }

  async findOne(
    userId: number,
    isCartOrder: boolean,
    selectedOnly?: boolean,
    buyItems?: BuyItem[],
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        phone: true,
        postal_code: true,
        address: true,
        is_active: true,
      },
    });

    if (!user) {
      throw new NotFoundException('회원을 찾을 수 없습니다.');
    }

    if (!user.is_active) {
      throw new BadRequestException('탈퇴한 회원입니다.');
    }

    let items: PayItemType[] = [];

    if (isCartOrder) {
      const cart = await this.prisma.cart.findUnique({
        where: {
          userId,
        },
        include: {
          cartItems: {
            where: selectedOnly
              ? {
                  is_selected: true,
                }
              : undefined,
            include: {
              detailColor: {
                include: {
                  products: true,
                },
              },
            },
          },
        },
      });

      if (!cart) {
        throw new NotFoundException('장바구니를 찾을 수 없습니다.');
      }

      if (cart.cartItems.length === 0) {
        throw new BadRequestException('장바구니가 비어 있습니다.');
      }

      items = cart.cartItems.map((item) => ({
        detail_color_id: item.detailColor.id,
        name: item.detailColor.products.name,
        colorName: item.detailColor.color_name,
        image: item.detailColor.products.color_main_image,
        quantity: item.quantity,
        price: item.detailColor.products.price,
        sale_price: this.getSalePrice(item.detailColor.products.price),
      }));
    } else {
      if (!buyItems || buyItems.length === 0) {
        throw new BadRequestException('상품 정보가 올바르지 않습니다.');
      }

      const products = await this.prisma.detailProduct.findMany({
        where: {
          id: {
            in: buyItems.map((item) => item.detailColorId),
          },
        },
        include: {
          products: true,
        },
      });

      if (products.length === 0) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }

      items = buyItems.map((buyItem) => {
        const product = products.find((p) => p.id === buyItem.detailColorId);

        if (!product) {
          throw new NotFoundException('상품을 찾을 수 없습니다.');
        }

        return {
          detail_color_id: product.id,
          name: product.products.name,
          colorName: product.color_name,
          image: product.products.color_main_image,
          quantity: buyItem.quantity,
          price: product.products.price,
          sale_price: this.getSalePrice(product.products.price),
        };
      });
    }

    return {
      recipient: user.name,
      phone_number: user.phone,
      postal_code: user.postal_code,
      delivery_info: user.address,
      isCartOrder,
      items,
    };
  }
}
