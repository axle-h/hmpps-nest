import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { HealthModule } from './health/health.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true, load: [config] }), HealthModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: APP_GUARD,
      useExisting: AuthenticatedGuard,
    },
    AuthenticatedGuard,
  ],
})
export class AppModule {}
