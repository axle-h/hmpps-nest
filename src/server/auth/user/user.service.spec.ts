import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/common';
import { mocked } from 'ts-jest/utils';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const config = mocked(ConfigService);
    const http = mocked(HttpService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: ConfigService, useValue: config }, { provide: HttpService, useValue: http }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
