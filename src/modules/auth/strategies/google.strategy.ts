import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import googleOauthConfig from 'src/configs/google-oauth.config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,

    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientID!,
      clientSecret: googleConfiguration.clientSecret!,
      callbackURL: googleConfiguration.callbackURL!,
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(profile: any) {
    console.log({ profile });

    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      avatarUrl: profile.photos[0].value,
      sub: profile.id,
      provider: 'google',
      providerId: profile.id,
      verified: true,
    });

    return user;
  }
}
