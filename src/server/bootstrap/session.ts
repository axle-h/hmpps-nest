import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { isProduction, RedisConfig, ServerConfig, SessionConfig } from '../config';
import * as connectRedis from 'connect-redis';
import * as session from 'express-session';
import * as redis from 'redis';

export function useRedisSession(app: NestExpressApplication) {
  const config = app.get(ConfigService);
  const serverConfig = config.get<ServerConfig>('server');
  const sessionConfig = config.get<SessionConfig>('session');
  const RedisStore = connectRedis(session);

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
}

export function useDummySession(app: NestExpressApplication) {
  if (isProduction()) {
    throw new Error('Dummy session is intended for e2e tests');
  }

  app.use(
    session({
      secret: 'development-session-secret',
      resave: false,
      saveUninitialized: false,
      rolling: true,
    }),
  );
}
