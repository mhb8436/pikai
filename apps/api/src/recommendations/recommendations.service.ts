import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';
import OpenAI from 'openai';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async recommendColor(dto: RecommendationRequestDto, userId: number) {
    // 1. 선택한 색상과 사용자 정보를 동시에 조회

    const [detailColor, user, ratings] = await Promise.all([
      this.prisma.detailProduct.findUnique({
        where: {
          id: dto.detailColorId,
        },

        // DetailProduct와 연결된 Product를 가져오고,
        // Product와 연결된 Category도 함께 가져온다.
        include: {
          products: {
            include: {
              category: true,
            },
          },
        },
      }),

      this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      }),

      this.prisma.rating.findMany({
        where: {
          user_id: userId,
        },
      }),
    ]);

    // 선택한 색상이 존재하지 않는 경우
    if (!detailColor) {
      throw new NotFoundException(
        `상세 색상 ID ${dto.detailColorId}를 찾을 수 없습니다.`,
      );
    }

    // 사용자가 존재하지 않는 경우
    if (!user) {
      throw new NotFoundException(`사용자 ID ${userId}를 찾을 수 없습니다.`);
    }

    if (!ratings.length) {
      console.log('사용자의 평점 데이터가 없습니다.');
    }

    // 2. 현재 선택한 색상의 HSL 값을 RGB로 변환

    const rgb = this.hslToRgb(detailColor.h, detailColor.s, detailColor.l);

    // 3. 사용자의 긍정 평점과 부정 평점 조회

    const [positiveRating, negativeRating] = await Promise.all([
      // 4~5점을 준 색상 중 점수가 가장 높은 색상 조회
      this.prisma.rating.findFirst({
        where: {
          user_id: userId,
          star_rating: {
            gte: 4,
            lte: 5,
          },
        },
        include: {
          detail_color: true,
        },
        orderBy: {
          star_rating: 'desc',
        },
      }),

      // 1~2점을 준 색상 중 점수가 가장 낮은 색상 조회
      this.prisma.rating.findFirst({
        where: {
          user_id: userId,
          star_rating: {
            gte: 1,
            lte: 2,
          },
        },
        include: {
          detail_color: true,
        },
        orderBy: {
          star_rating: 'asc',
        },
      }),
    ]);

    // 4. 긍정 평점 색상 정보 만들기

    const positiveColor = positiveRating
      ? {
          starRating: positiveRating.star_rating,
          colorName: positiveRating.detail_color.color_name,

          hsl: {
            h: positiveRating.detail_color.h,
            s: positiveRating.detail_color.s,
            l: positiveRating.detail_color.l,
          },

          rgb: this.hslToRgb(
            positiveRating.detail_color.h,
            positiveRating.detail_color.s,
            positiveRating.detail_color.l,
          ),
        }
      : null;

    // 5. 부정 평점 색상 정보 만들기

    const negativeColor = negativeRating
      ? {
          starRating: negativeRating.star_rating,
          colorName: negativeRating.detail_color.color_name,

          hsl: {
            h: negativeRating.detail_color.h,
            s: negativeRating.detail_color.s,
            l: negativeRating.detail_color.l,
          },

          rgb: this.hslToRgb(
            negativeRating.detail_color.h,
            negativeRating.detail_color.s,
            negativeRating.detail_color.l,
          ),
        }
      : null;

    // 6. AI에게 전달할 프롬프트 만들기

    // 먼저 사용자의 퍼스널 컬러를 알려준다.

    //==> systemPrompt (고정 지침)
    const systemPrompt = `
    너는 온라인 화장품 쇼핑몰의 전문 컬러 컨설턴트이다.

    사용자의 퍼스널 컬러와 이전 색상 평가 기록을 참고하여
    현재 선택한 색상이 얼마나 잘 어울리는지 판단한다.

    평가 기준은 다음과 같다.

    1 : 매우 어울리지 않음
    2 : 어울리지 않음
    3 : 보통
    4 : 잘 어울림
    5 : 매우 잘 어울림

    단,
    현재 선택한 색상이 사용자가 이전에 높은 점수를 준 색상과
    사람의 눈으로 거의 구분하기 어려울 정도로 매우 유사하다면
    6을 반환한다.

    반드시 1, 2, 3, 4, 5, 6 중
    숫자 하나만 반환한다.

    설명, 문장, 기호는 절대 출력하지 않는다.
    `;

    // let prompt = `${user.personal_color} 톤 사용자입니다.`;
    // 1.항목 이름(Label) 을 붙여주는 것이 GPT가 정보를 구분하기 훨씬 쉽다고 함
    let prompt = `퍼스널 컬러: ${user.personal_color}`;
    //==============================================

    // 사용자가 4~5점을 준 색상이 있는 경우
    //2.긍정 평가 문장을 라벨 형식으로 변경
    if (positiveRating) {
      const positiveRgb = this.hslToRgb(
        positiveRating.detail_color.h,
        positiveRating.detail_color.s,
        positiveRating.detail_color.l,
      );

      prompt += `

긍정 평가 색상:
- RGB: rgb(${positiveRgb.r}, ${positiveRgb.g}, ${positiveRgb.b})
- 평점: ${positiveRating.star_rating}
- 평가 결과: 잘 어울렸던 색상`;
    }

    // 사용자가 1~2점을 준 색상이 있는 경우
    //3.부정 평가도 같은 형식으로 변경
    if (negativeRating) {
      const negativeRgb = this.hslToRgb(
        negativeRating.detail_color.h,
        negativeRating.detail_color.s,
        negativeRating.detail_color.l,
      );

      prompt += `

부정 평가 색상:
- RGB: rgb(${negativeRgb.r}, ${negativeRgb.g}, ${negativeRgb.b})
- 평점: ${negativeRating.star_rating}
- 평가 결과: 잘 어울리지 않았던 색상`;
    }

    // 현재 선택한 상품 정보와 평가 규칙을 추가한다.
    //4. 현재 선택한 상품 정보도 라벨 형식으로 정리
    prompt += `

현재 선택한 상품:
- 카테고리: ${detailColor.products.category.name}
- 색상명: ${detailColor.color_name}
- HSL: hsl(${detailColor.h}, ${detailColor.s}%, ${detailColor.l}%)
- RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})
위 정보를 바탕으로 현재 선택한 색상을 평가하세요.`;

    const aiInput = {
      // 실제 AI가 읽고 판단할 프롬프트
      prompt,

      // 사용자 퍼스널 컬러
      userPersonalColor: user.personal_color,

      // 현재 선택한 상품과 색상 정보
      selectedColor: {
        colorName: detailColor.color_name,
        category: detailColor.products.category.name,

        hsl: {
          h: detailColor.h,
          s: detailColor.s,
          l: detailColor.l,
        },

        rgb,
      },

      // 사용자가 4~5점을 준 색상
      positiveColor,

      // 사용자가 1~2점을 준 색상
      negativeColor,
    };

    //=========================
    // Azure OpenAI 환경변수
    const endpoint = process.env['AZURE_OPENAI_ENDPOINT'];
    const azureApiKey = process.env['AZURE_OPENAI_KEY'];

    // 환경변수 검증
    if (!endpoint || !azureApiKey) {
      throw new Error('Azure OpenAI 환경변수가 누락되었습니다.');
    }

    // Azure AI Foundry에서 만든 실제 배포 이름
    const deploymentId = 'gpt-5';

    // endpoint 마지막의 /를 제거한 뒤 v1 경로 추가
    const baseURL = `${endpoint.replace(/\/$/, '')}/openai/v1/`;

    const client = new OpenAI({
      apiKey: azureApiKey,
      baseURL,
      defaultHeaders: {
        'api-key': azureApiKey,
      },
    });
    let answer: string;

    try {
      const result = await client.chat.completions.create({
        model: deploymentId,
        messages: [
          {
            role: 'system',
            content: systemPrompt, //(고정 지침)
          },
          {
            role: 'user',
            content: aiInput.prompt, //(매번 바뀌는 데이터)
          },
        ],
        max_completion_tokens: 2000,
      });

      const content = result.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new NotFoundException('Azure OpenAI 응답이 비어 있습니다.');
      }
      if (!/^[1-6]$/.test(content)) {
        throw new InternalServerErrorException(
          `Azure OpenAI 응답 형식이 올바르지 않습니다: ${content}`,
        );
      }

      // const answer가 아니라, 위에서 선언한 answer에 값 저장
      answer = content;

      // 여기 아래에는 기존 return 코드가 있으면 그대로 두세요.
    } catch (error: any) {
      console.error('========== Azure OpenAI 오류 ==========');
      console.error('message:', error?.message);
      console.error('status:', error?.status);
      console.error('code:', error?.code);
      console.error('전체 오류:', error);

      throw error;
    }

    return {
      // 테스트할 때 AI에 어떤 정보가 전달됐는지 확인하기 위한 값
      aiInput,

      detailColorId: detailColor.id,

      user: {
        id: user.id,
        personalColor: user.personal_color,
      },

      color: {
        name: detailColor.color_name,
        image: detailColor.color_image,
        stock: detailColor.stock,

        hsl: {
          h: detailColor.h,
          s: detailColor.s,
          l: detailColor.l,
        },

        rgb,
      },

      product: {
        id: detailColor.products.id,
        name: detailColor.products.name,
        category: detailColor.products.category.name,
        price: detailColor.products.price,
      },

      // Azure OpenAI가 반환한 추천 점수를 사용합니다.
      answer,
    };
  }

  // HSL 색상 값을 RGB 색상 값으로 변환하는 함수

  private hslToRgb(h: number, s: number, l: number) {
    // 백분율 값을 0~1 사이 값으로 변환
    s /= 100;
    l /= 100;

    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const hueSection = h / 60;
    const x = chroma * (1 - Math.abs((hueSection % 2) - 1));

    let r1 = 0;
    let g1 = 0;
    let b1 = 0;

    if (hueSection >= 0 && hueSection < 1) {
      r1 = chroma;
      g1 = x;
    } else if (hueSection >= 1 && hueSection < 2) {
      r1 = x;
      g1 = chroma;
    } else if (hueSection >= 2 && hueSection < 3) {
      g1 = chroma;
      b1 = x;
    } else if (hueSection >= 3 && hueSection < 4) {
      g1 = x;
      b1 = chroma;
    } else if (hueSection >= 4 && hueSection < 5) {
      r1 = x;
      b1 = chroma;
    } else {
      r1 = chroma;
      b1 = x;
    }

    const m = l - chroma / 2;

    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  }
}
