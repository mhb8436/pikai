import { Module } from '@nestjs/common';
import { DetailproductService } from './detailproduct.service';
import { DetailproductController } from './detailproduct.controller';

@Module({
  controllers: [DetailproductController],
  providers: [DetailproductService],
})
export class DetailproductModule {}
