import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { mocked } from 'ts-jest/utils';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/common';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const config = mocked(ConfigService);
    const http = mocked(HttpService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: ConfigService, useValue: config },
        { provide: HttpService, useValue: http },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
