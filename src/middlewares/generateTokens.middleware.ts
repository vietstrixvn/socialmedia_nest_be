// generate-tokens.util.ts
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from 'src/configs/refresh-jwt.config';
import { AuthJwtPayload } from 'src/modules/auth/types/auth-jwtPayload';

export async function generateTokens(
  _id: string,
  jwtService: JwtService,
  refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
) {
  const payload: AuthJwtPayload = { sub: _id };

  const accessToken = await jwtService.signAsync(payload, {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: '15m', // luôn dùng chuỗi hợp lệ
  });

  const refreshToken = await jwtService.signAsync(payload, {
    secret: refreshTokenConfig.secret,
    expiresIn: refreshTokenConfig.expiresIn, // phải number(giây) hoặc '7d'
  });

  return { accessToken, refreshToken };
}
