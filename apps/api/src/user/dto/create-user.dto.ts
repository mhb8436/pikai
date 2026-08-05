import { ApiProperty } from '@nestjs/swagger';
import { PersonalColor } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  @MinLength(2)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumberString({})
  @Length(5, 5)
  postal_code: string;

  @IsString()
  @MinLength(2)
  address: string;

  @IsNumberString()
  @Length(11, 11)
  phone: string;

  @IsEnum(PersonalColor)
  personal_color: PersonalColor;

  @IsBoolean()
  @IsOptional()
  is_admin: boolean = false;
}
