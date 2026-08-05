import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.to';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Constants } from 'src/common/constants';
import { LoginDto } from './dto/login.dto';
import { PersonalColor } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 기존 유저 체크 (지금 사용중인 유저 와 비 사용중 유저 중 탈퇴한지 한달이 안 지났을 시 해당 이메일로 못 가입하게 한다.)
    const exist = await this.userService.findByEmail(dto.email);
    if (exist) {
      throw new ConflictException(
        `이미 있는 유저이거나 탈퇴한지 한달이 되지 않은 유저입니다.`,
      );
    }
    const hashed = await bcrypt.hash(dto.password, Constants.round);
    const user = await this.userService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashed,
      is_admin: false,
      postal_code: dto.postal_code,
      address: dto.address,
      phone: dto.phone,
      personal_color: dto.personal_color,
    });

    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀러요');
    }
    // else if 해서 False 이고 한달전이면 throw
    // db에 저장된 해시 비교
    const isRight = await bcrypt.compare(dto.password, user.password);
    if (!isRight)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀러요');

    // jwt 내려주기 위해 암호화
    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.is_admin,
      tone: user.personal_color,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async changePersonalColor(userId: number, personalColor: PersonalColor) {
    const user = await this.userService.update(
      { personal_color: personalColor },
      userId,
    );
    if (!user) {
      throw new UnauthorizedException('유저를 수정 중 오류 발생');
    }

    // jwt 내려주기 위해 암호화
    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.is_admin,
      tone: user.personal_color,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
