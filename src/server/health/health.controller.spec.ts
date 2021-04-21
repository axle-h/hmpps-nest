import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { mocked } from 'ts-jest/utils';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const service = mocked(HealthService);
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: HealthService, useValue: service }],
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
