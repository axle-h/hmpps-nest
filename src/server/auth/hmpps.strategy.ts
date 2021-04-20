import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { UserService } from './user/user.service';
import { ConfigService } from '@nestjs/config';
import { AuthApiConfig, ServerConfig } from '../config';

@Injectable()
export class HmppsStrategy extends PassportStrategy(Strategy, 'hmpps') {
  private static getOAuth2Settings(config: ConfigService) {
    const { url, externalUrl, apiClientCredentials } = config.get<AuthApiConfig>('apis.auth');
    const { domain } = config.get<ServerConfig>('server');
    const token = Buffer.from(`${apiClientCredentials.id}:${apiClientCredentials.secret}`).toString('base64');
    return {
      authorizationURL: `${externalUrl}/oauth/authorize`,
      tokenURL: `${url}/oauth/token`,
      clientID: apiClientCredentials.id,
      clientSecret: apiClientCredentials.secret,
      callbackURL: `${domain}/login/callback`,
      state: true,
      customHeaders: { Authorization: `Basic ${token}` }, // TODO can passport-oauth2 be configured to do this for us?
    };
  }

  constructor(private readonly userService: UserService, private readonly config: ConfigService) {
    super(HmppsStrategy.getOAuth2Settings(config));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(token: string, refreshToken: string, params: any): Promise<any> {
    return this.userService.getUser(token);
  }
}
