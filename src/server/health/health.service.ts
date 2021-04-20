import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { HttpService, Injectable, Logger } from '@nestjs/common';
import { Health, HealthError } from './types';
import { ConfigService } from '@nestjs/config';
import { ApiConfig, ApisConfig, DependentServiceName } from '../config';

const readFile = promisify(fs.readFile);

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly http: HttpService, private readonly config: ConfigService) {}

  async getHealth(): Promise<Health> {
    const checkPromises = Object.entries(this.config.get<ApisConfig>('apis'))
      .filter(([, config]) => config.enabled)
      .map(([name, config]) => this.service(name as DependentServiceName, config));
    const checks = await Promise.all(checkPromises);

    const build = await this.getBuildInfo();
    const result: Health = {
      healthy: checks.length === 0 || checks.every((x) => x.healthy),
      checks: checks.reduce((agg, x) => ({ ...agg, [x.service]: x.result }), {}),
      uptime: process.uptime(),
      build,
      version: build?.buildNumber,
    };

    if (result.healthy) {
      return result;
    }

    throw new HealthError(result);
  }

  private async getBuildInfo(): Promise<Health['build']> {
    try {
      const json = await readFile(path.join(__dirname, 'build-info.json'), { encoding: 'utf8' });
      return JSON.parse(json);
    } catch (e) {
      this.logger.error(`failed to read build info ${e.message}`);
      return null;
    }
  }

  private async service(
    service: DependentServiceName,
    config: ApiConfig,
  ): Promise<{ service: DependentServiceName; healthy: boolean; result: any }> {
    try {
      const result = await this.http.get(`${config.url}/health/ping`).toPromise();
      return { service, healthy: true, result: result.data };
    } catch (e) {
      const message = e.response?.data || e.message;
      this.logger.error(`${service} is unhealthy ${message}`);
      return { service, healthy: false, result: message };
    }
  }
}
