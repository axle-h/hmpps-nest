import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as nunjucks from 'nunjucks';
import * as helmet from 'helmet';
import * as redis from 'redis';
import * as passport from 'passport';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import * as connectRedis from 'connect-redis';
import { ErrorFilter } from './error.filter';
import { ConfigService } from '@nestjs/config';
import { RedisConfig, ServerConfig, SessionConfig } from './config';

const RedisStore = connectRedis(session);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});

  const config = app.get(ConfigService);

  // GovUK Template Configuration
  app.setLocal('asset_path', '/assets/');
  app.setLocal('applicationName', 'HMPPS Nest');

  app.useGlobalGuards(new AuthenticatedGuard());
  app.useGlobalFilters(new ErrorFilter());

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: ["'self'", "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='"],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
        },
      },
    }),
  );

  nunjucks
    .configure(
      [
        path.join(__dirname, 'views'),
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

  const serverConfig = config.get<ServerConfig>('server');
  app.useStaticAssets(path.join(__dirname, 'assets'), {
    prefix: '/assets',
    maxAge: serverConfig.staticResourceCacheDuration * 1000,
  });
  app.setBaseViewsDir(path.join(__dirname, 'views'));
  app.setViewEngine('njk');

  // Session
  const sessionConfig = config.get<SessionConfig>('session');
  app.use(
    session({
      store: new RedisStore({
        client: redis.createClient({ ...config.get<RedisConfig>('redis') }),
      }),
      cookie: {
        secure: serverConfig.https,
        sameSite: 'lax',
        maxAge: sessionConfig.expiryMinutes * 60 * 1000,
      },
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // always pass the user to the template
  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });

  await app.listen(3000);
}

bootstrap();
