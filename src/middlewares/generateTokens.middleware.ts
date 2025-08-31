// generate-tokens.util.ts
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import refreshJwtConfig from 'src/configs/refresh-jwt.config';
import { AuthJwtPayload } from 'src/modules/auth/types/auth-jwtPayload';

export async function generateTokens(
  _id: string,
  jwtService: JwtService,
  refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
) {
  const payload: AuthJwtPayload = { sub: _id };

  const [accessToken, refreshToken] = await Promise.all([
    jwtService.signAsync(payload),
    jwtService.signAsync(payload, refreshTokenConfig),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}
