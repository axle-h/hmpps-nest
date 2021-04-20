import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true, load: [config] }), HealthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
