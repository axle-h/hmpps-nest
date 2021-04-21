import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/server/app.module';
import { AuthenticatedGuard } from '../src/server/auth/guards/authenticated.guard';
import { useDummySession, useGovUkUi } from '../src/server/bootstrap';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';

class DummyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    return true;
  }
}

export class E2eFixture {
  private app: NestExpressApplication;

  async init() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthenticatedGuard)
      .useClass(DummyGuard)
      .compile();

    this.app = moduleFixture.createNestApplication<NestExpressApplication>();
    useGovUkUi(this.app);
    useDummySession(this.app);
    await this.app.init();
  }

  request() {
    return request(this.app.getHttpServer());
  }
}
