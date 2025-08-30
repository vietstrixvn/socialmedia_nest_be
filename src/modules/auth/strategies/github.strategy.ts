// github.strategy.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import githubOauthConfig from 'src/configs/github-oauth.config';
import { AuthService } from '../auth.service';

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

  async validate(profile: any) {
    console.log({ profile });

    const { id, username, photos, emails } = profile;

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
