import { PartialType, PickType } from '@nestjs/swagger';
import { CreateRatingDto } from './create-rating.dto';

export class UpdateRatingDto extends PartialType(
  PickType(CreateRatingDto, ['is_comp', 'star_rating'] as const),
) {}
