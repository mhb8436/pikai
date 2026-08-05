import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Constants } from '../common/constants';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      // login에서 sign() jwt token 만들기 위한 시크릿 정보
      secret: Constants.secret,
      // access_token 은 짧게(1시간) , Refresh_token은 길게(14d)
      // 이건 access_token , 테스트용으로 길게 설정
      signOptions: { expiresIn: '14d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
