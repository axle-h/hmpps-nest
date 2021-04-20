import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthApiConfig } from '../../config';
import { startCase } from 'lodash';

interface UserDetails {
  name: string;
  displayName: string;
}

@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService, private readonly config: ConfigService) {}

  async getUser(token: string): Promise<UserDetails> {
    const { url } = this.config.get<AuthApiConfig>('apis.auth');
    const response = await this.httpService
      .get(`${url}/api/user/me`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .toPromise();
    return {
      ...response.data,
      displayName: startCase(response.data.name as string),
    };
  }
}
