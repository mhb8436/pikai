import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RatingModule } from './rating/rating.module';
import { ToneModule } from './tone/tone.module';
import { UserModule } from './user/user.module';
import { PayModule } from './pay/pay.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { DetailproductModule } from './detailproduct/detailproduct.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

@Module({
  imports: [
    PrismaModule,
    ProductModule,
    CartModule,
    OrderModule,
    UserModule,
    PayModule,
    AuthModule,
    RatingModule,
    ToneModule,
    AdminModule,
    BrandModule,
    CategoryModule,
    DetailproductModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
