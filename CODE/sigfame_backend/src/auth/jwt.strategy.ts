import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey', // 🔴 CAMBIAR EN PRODUCCIÓN
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, role: payload.role, area: payload.area };
  }
}
