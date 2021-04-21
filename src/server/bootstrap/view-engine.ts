import { NestExpressApplication } from '@nestjs/platform-express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { ServerConfig } from '../config';

export function useGovUkUi(app: NestExpressApplication) {
  app.setLocal('asset_path', '/assets/');
  app.setLocal('applicationName', 'HMPPS Nest');

  nunjucks
    .configure(
      [
        path.resolve(path.join(__dirname, 'views')),
        'node_modules/govuk-frontend/',
        'node_modules/govuk-frontend/components/',
        'node_modules/@ministryofjustice/frontend/',
        'node_modules/@ministryofjustice/frontend/moj/components/',
      ],
      { express: app.getHttpAdapter().getInstance(), autoescape: true },
    )
    .addFilter('initialiseName', (fullName: string) => {
      if (!fullName) {
        return null;
      }
      const [first, ...last] = fullName.split(' ');
      if (last.length === 0) {
        return first;
      }
      return `${first[0]}. ${last[last.length - 1]}`;
    });

  const serverConfig = app.get(ConfigService).get<ServerConfig>('server');
  app.useStaticAssets(path.join(__dirname, 'assets'), {
    prefix: '/assets',
    maxAge: serverConfig.staticResourceCacheDuration * 1000,
  });
  app.setBaseViewsDir(path.join(__dirname, 'views'));
  app.setViewEngine('njk');

  // always pass the user to the template
  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });
}
