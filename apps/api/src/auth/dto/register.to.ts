import { ApiProperty } from '@nestjs/swagger';
import { PersonalColor } from '@prisma/client';
import {
  IsString,
  MinLength,
  IsEmail,
  IsNumberString,
  Length,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @ApiProperty({ example: '김유저' })
  name: string;

  @IsEmail()
  @MinLength(2)
  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: '123123' })
  password: string;

  @IsNumberString({})
  @Length(5, 5)
  @ApiProperty({ example: '01234' })
  postal_code: string;

  @IsString()
  @MinLength(2)
  @ApiProperty({ example: '서울시 금천구 00대로 1111 1010호' })
  address: string;

  @IsNumberString()
  @Length(11, 11)
  @ApiProperty({ example: '01011111111' })
  phone: string;

  @IsEnum(PersonalColor)
  @ApiProperty({ example: PersonalColor.COOL })
  personal_color: PersonalColor;
}
