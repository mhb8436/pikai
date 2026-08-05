import { PersonalColor } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @ApiProperty({ example: '서울시 관악구' })
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '101' })
  postal_code?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '123123' })
  current_password?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @ApiProperty({ example: '123123123' })
  password?: string;

  @IsEnum(PersonalColor)
  @IsOptional()
  @ApiProperty({ example: PersonalColor.COOL })
  personal_color?: PersonalColor;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: false })
  is_active?: boolean;
}
