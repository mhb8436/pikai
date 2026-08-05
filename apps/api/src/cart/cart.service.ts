import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartitemDto } from './dto/create-cartitem.dto';
import { UpdateCartitemDto } from './dto/update-cartitem.dto';
import { UpdateCartitemSelectDto } from './dto/update-cartitemselect.dto';
import { QueryCartDto } from './dto/query-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Cart

  /* 장바구니 생성 */
  async createCart(createCartDto: CreateCartDto) {
    const { userId } = createCartDto;

    // 회원이 실제로 존재하는지 확인
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 회원을 찾을 수 없습니다.`);
    }

    // userId가 @unique이므로 기존 장바구니 중복 확인
    const existingCart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (existingCart) {
      throw new ConflictException('해당 회원의 장바구니가 이미 존재합니다.');
    }

    return this.prisma.cart.create({
      data: {
        userId,
      },
      include: {
        user: true,
        cartItems: true,
      },
    });
  }

  /* 로그인 회원의 장바구니 조회 또는 생성 */
  async findOrCreateMyCart(userId: number) {
    // 로그인 회원의 기존 장바구니를 확인합니다.
    const existingCart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    // 장바구니가 이미 있다면 새로 만들지 않고 그대로 반환합니다.
    if (existingCart) {
      return existingCart;
    }

    // 새 회원처럼 장바구니가 없다면 로그인 회원 ID로 생성합니다.
    return this.prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  /** 전체 장바구니 조회 관리자용 */
  async findAll() {
    return this.prisma.cart.findMany({
      include: {
        user: true,

        cartItems: {
          include: {
            detailColor: true,
          },
        },
      },

      orderBy: {
        id: 'desc',
      },
    });
  }
  //결제 페이지용
  /*  회원 ID로 장바구니 조회 */
  async findCartByUserId(query: QueryCartDto, userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        user: {
          select: {
            // 받는 분
            name: true,

            // 연락처
            phone: true,

            // 우편번호
            postal_code: true,

            // 주소
            address: true,
          },
        },

        // 원래코드
        cartItems: {
          where: {
            is_selected: query.selectedOnly ?? false,
            is_now:
              query.isCartOrder !== undefined ? !query.isCartOrder : false,
          },

          include: {
            detailColor: {
              include: {
                // 상품 정보도 함께 조회
                products: true,
              },
            },
          },

          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(
        `userId가 ${userId}인 회원의 장바구니를 찾을 수 없습니다.`,
      );
    }

    return cart;
  }
  //===============================================
  /* 장바구니 화면 전용 조회 */
  async findCartPageByUserId(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        user: {
          select: {
            // 받는 분
            name: true,

            // 연락처
            phone: true,

            // 우편번호
            postal_code: true,

            // 주소
            address: true,
          },
        },

        cartItems: {
          where: {
            // 일반 장바구니 상품만 조회합니다.
            // is_selected 값은 조회 조건으로 사용하지 않고
            // 체크박스 표시용 값으로 그대로 가져옵니다.
            is_now: false,
          },

          include: {
            detailColor: {
              include: {
                // 상품 정보도 함께 조회합니다.
                products: true,
              },
            },
          },

          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(
        `userId가 ${userId}인 회원의 장바구니를 찾을 수 없습니다.`,
      );
    }

    return cart;
  }
  //===============================================
  /* 바로구매 결제화면 전용 조회 */
  async findBuyNowCartByUserId(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        user: {
          select: {
            // 받는 분
            name: true,

            // 연락처
            phone: true,

            // 우편번호
            postal_code: true,

            // 주소
            address: true,
          },
        },

        cartItems: {
          where: {
            // 바로구매를 위해 임시 저장한 상품만 조회합니다.
            // is_selected 값은 조회 조건으로 사용하지 않습니다.
            is_now: true,
          },

          include: {
            detailColor: {
              include: {
                // 결제 화면에 필요한 상품 정보도 함께 조회합니다.
                products: true,
              },
            },
          },

          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(
        `userId가 ${userId}인 회원의 장바구니를 찾을 수 없습니다.`,
      );
    }

    return cart;
  }
  //===============================================
  // CartItem

  //장바구니 상품 추가
  //같은 장바구니에 같은 DetailProduct가 이미 있으면
  //새로운 행을 만들지 않고 quantity를 증가시킵니다.
  // 요청값에서 장바구니 ID, 상품 옵션 ID, 수량만 꺼냅니다
  async createCartitem(createCartitemDto: CreateCartitemDto) {
    const {
      cart_id,
      detail_color_id,
      quantity,
      is_now = false,
    } = createCartitemDto;

    // 장바구니 존재 여부 확인
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cart_id,
      },
    });

    if (!cart) {
      throw new NotFoundException(
        `ID가 ${cart_id}인 장바구니를 찾을 수 없습니다.`,
      );
    }

    // DetailProduct 존재 여부 확인
    // 상품 옵션과 함께 상품 정보(가격)도 조회합니다.
    const detailColor = await this.prisma.detailProduct.findUnique({
      where: {
        id: detail_color_id,
      },
      include: {
        products: true,
      },
    });

    if (!detailColor) {
      throw new NotFoundException(
        `ID가 ${detail_color_id}인 상품 옵션을 찾을 수 없습니다.`,
      );
    }
    // 요청 수량이 재고보다 많은지 확인
    if (quantity > detailColor.stock) {
      throw new BadRequestException(
        `재고가 부족합니다. 현재 재고는 ${detailColor.stock}개입니다.`,
      );
    }

    // 같은 상품 옵션이 장바구니에 이미 담겨 있는지 확인
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        cart_id_detail_color_id: {
          cart_id,
          detail_color_id,
        },
      },
    });

    // 기존 수량과 새로 추가할 수량의 합이 재고를 초과하는지 확인
    if (
      existingCartItem &&
      existingCartItem.quantity + quantity > detailColor.stock
    ) {
      throw new BadRequestException(
        `재고가 부족합니다. 현재 재고는 ${detailColor.stock}개이고, 장바구니에는 이미 ${existingCartItem.quantity}개가 담겨 있습니다.`,
      );
    }
    // 원가에서 항상 10% 할인한 판매 가격을 계산합니다.
    //const discountedPrice = Math.floor(detailColor.products.price * 0.9);
    //
    //
    //schema.prisma의 아래 제약조건을 사용합니다.
    //@@unique([cart_id, detail_color_id])
    //Prisma에서는 복합 unique 이름이
    //cart_id_detail_color_id로 생성됩니다.

    return this.prisma.cartItem.upsert({
      where: {
        cart_id_detail_color_id: {
          cart_id,
          detail_color_id,
        },
      },

      // 이미 담긴 상품이면 수량 증가
      update: {
        quantity: {
          increment: quantity,
        },
        is_selected: true,
        is_now,
      },

      // 처음 담는 상품이면 새로 생성
      create: {
        cart_id,
        detail_color_id,
        quantity,
        // 정가 가격을 저장합니다.
        price: detailColor.products.price,

        // 바로구매이면 true,
        // 일반 장바구니이면 false로 저장합니다.
        is_now,
      },

      include: {
        cart: true,
        detailColor: true,
      },
    });
  }

  /* 장바구니 상품 수량 수정 */
  async updateCartitem(
    cartItemId: number,
    updateCartItemDto: UpdateCartitemDto,
  ) {
    const cartItem = await this.findCartitemById(cartItemId);

    /* 재고 조사 */
    const detailColor = await this.prisma.detailProduct.findUnique({
      where: {
        id: cartItem.detail_color_id,
      },
    });

    if (!detailColor) {
      throw new NotFoundException(
        `ID가 ${cartItem.detail_color_id}인 상품 옵션을 찾을 수 없습니다.`,
      );
    }

    // 변경하려는 수량이 현재 상품 재고보다 많은지 확인
    if (updateCartItemDto.quantity > detailColor.stock) {
      throw new BadRequestException(
        `재고가 부족합니다. 현재 재고는 ${detailColor.stock}개입니다.`,
      );
    }

    return this.prisma.cartItem.update({
      where: {
        id: cartItemId,
      },

      data: {
        quantity: updateCartItemDto.quantity,
      },

      include: {
        detailColor: true,
      },
    });
  }

  /* 장바구니 상품 선택 또는 선택 해제 */
  async updateCartitemSelect(
    cartItemId: number,
    updateCartItemSelectDto: UpdateCartitemSelectDto,
  ) {
    await this.findCartitemById(cartItemId);

    return this.prisma.cartItem.update({
      where: {
        id: cartItemId,
      },

      data: {
        is_selected: updateCartItemSelectDto.is_selected,
      },

      include: {
        detailColor: true,
      },
    });
  }
  //=========================================
  /* 로그인 회원의 바로구매 임시 상품 삭제 */
  async deleteBuyNowItems(userId: number) {
    // 로그인 회원의 장바구니를 찾습니다.
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException(
        `userId가 ${userId}인 회원의 장바구니를 찾을 수 없습니다.`,
      );
    }

    // 일반 장바구니 상품은 남겨두고
    // is_now=true인 바로구매 임시 상품만 삭제합니다.
    const result = await this.prisma.cartItem.deleteMany({
      where: {
        cart_id: cart.id,
        is_now: true,
      },
    });

    return {
      message: '기존 바로구매 상품이 삭제되었습니다.',
      deletedCount: result.count,
    };
  }

  //=========================================
  /* 장바구니 상품 한 개 삭제 */
  async deleteCartitem(cartItemId: number) {
    await this.findCartitemById(cartItemId);

    const deletedItem = await this.prisma.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });

    return {
      message: '장바구니 상품이 삭제되었습니다.',
      deletedItem,
    };
  }

  /* 특정 장바구니의 모든 상품 삭제
   
   * Cart는 삭제하지 않고 CartItem만 삭제합니다. */
  async clearCart(cartId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
    });

    if (!cart) {
      throw new NotFoundException(
        `ID가 ${cartId}인 장바구니를 찾을 수 없습니다.`,
      );
    }

    const result = await this.prisma.cartItem.deleteMany({
      where: {
        cart_id: cartId,
      },
    });

    return {
      message: '장바구니의 모든 상품이 삭제되었습니다.',
      deletedCount: result.count,
    };
  }

  /**
   * CartItem 존재 여부 확인용 내부 메서드
   */
  private async findCartitemById(cartItemId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(
        `ID가 ${cartItemId}인 장바구니 상품을 찾을 수 없습니다.`,
      );
    }

    return cartItem;
  }
}
