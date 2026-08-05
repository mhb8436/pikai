import { Module } from '@nestjs/common';
import { ToneService } from './tone.service';
import { ToneController } from './tone.controller';

@Module({
  controllers: [ToneController],
  providers: [ToneService],
})
export class ToneModule {}
