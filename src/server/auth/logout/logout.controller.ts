import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthApiConfig, ServerConfig } from '../../config';

@Controller('logout')
export class LogoutController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  get(@Req() request: Request, @Res() response: Response) {
    const { externalUrl, apiClientCredentials } = this.config.get<AuthApiConfig>('apis.auth');
    const { domain } = this.config.get<ServerConfig>('server');
    const authLogoutUrl = `${externalUrl}/logout?client_id=${apiClientCredentials.id}&redirect_uri=${domain}`;
    request.logOut();
    request.session.destroy(() => response.redirect(authLogoutUrl));
  }
}
