import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: '111111' })
  @MinLength(6)
  password: string;
}
