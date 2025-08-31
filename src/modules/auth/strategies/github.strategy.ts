// github.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import githubOauthConfig from 'src/configs/github-oauth.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @Inject(githubOauthConfig.KEY)
    private githubConfiguration: ConfigType<typeof githubOauthConfig>,

    private authService: AuthService,
  ) {
    super({
      clientID: githubConfiguration.clientID,
      clientSecret: githubConfiguration.clientSecret,
      callbackURL: githubConfiguration.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log({ profile });

    const { id, username, displayName, photos, emails } = profile;

    const user = await this.authService.validateGithubUser({
      email: emails?.[0]?.value,
      username,
      avatarUrl: photos?.[0]?.value,
      provider: 'github',
      providerId: id,
      verified: true,
    });

    return user;
  }
}
