import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Constants } from 'src/common/constants';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Constants.secret,
    });
  }
  validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin,
      tone: payload.tone,
    };
  }
}
