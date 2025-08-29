import { registerAs } from '@nestjs/config';

export default registerAs('githubOAuth', () => ({
  clinetID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
}));
