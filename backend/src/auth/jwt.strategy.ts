import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Looks for "Authorization: Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: 'super-secret-key-change-in-production', // Must match the secret in auth.module.ts
    });
  }

  async validate(payload: any) {
    // Whatever is returned here gets attached to request.user
    return { userId: payload.sub, email: payload.email };
  }
}