export interface ServerConfig {
  https: boolean;
  domain: string;
  staticResourceCacheDuration: number;
}

export interface RedisConfig {
  port: number;
  host: string;
  password: string;
  tls: boolean;
}

export interface SessionConfig {
  secret: string;
  expiryMinutes: number;
}

export interface AgentConfig {
  maxSockets: number;
  maxFreeSockets: number;
  freeSocketTimeout: number;
}

function defaultAgentConfig(): AgentConfig {
  return {
    maxSockets: 100,
    maxFreeSockets: 10,
    freeSocketTimeout: 30000,
  };
}

export interface ApiConfig {
  enabled: boolean;
  url: string;
  timeout: {
    response: number;
    deadline: number;
  };
  agent: AgentConfig;
}

export interface ClientCredentials {
  id: string;
  secret: string;
}

export interface AuthApiConfig extends ApiConfig {
  externalUrl: string;
  apiClientCredentials: ClientCredentials;
  systemClientCredentials: ClientCredentials;
}

export enum DependentServiceName {
  Auth = 'auth',
  TokenVerification = 'tokenVerification',
}

export interface ApisConfig {
  [DependentServiceName.Auth]: AuthApiConfig;
  [DependentServiceName.TokenVerification]: ApiConfig;
}

export interface Config {
  server: ServerConfig;
  redis: RedisConfig;
  session: SessionConfig;
  apis: ApisConfig;
}

interface EnvironmentFallback<T> {
  value: T;
  developmentOnly: boolean;
}

function fallback<T>(value: T): EnvironmentFallback<T> {
  return { value, developmentOnly: false };
}

function developmentOnly<T>(value: T): EnvironmentFallback<T> {
  return { value, developmentOnly: true };
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function env<T>(name: string, parse: (value: string) => T, fallback?: EnvironmentFallback<T>): T {
  if (process.env[name] !== undefined) {
    return parse(process.env[name]);
  }

  if (fallback !== undefined && (!isProduction() || !fallback.developmentOnly)) {
    return fallback.value;
  }

  throw new Error(`Missing env var ${name}`);
}

function string(name: string, fallback?: EnvironmentFallback<string>): string {
  return env(name, (x) => x, fallback);
}

function int(name: string, fallback?: EnvironmentFallback<number>): number {
  return env(name, (x) => parseInt(x, 10), fallback);
}

function bool(name: string, fallback?: EnvironmentFallback<boolean>): boolean {
  return env(name, (x) => x === 'true', fallback);
}

export function config(): Config {
  const authUrl = string('HMPPS_AUTH_URL', developmentOnly('http://localhost:9090/auth'));
  return {
    server: {
      https: bool('PROTOCOL_HTTPS', fallback(isProduction())),
      domain: string('INGRESS_URL', developmentOnly('http://localhost:3000')),
      staticResourceCacheDuration: int('STATIC_RESOURCE_CACHE_DURATION', fallback(20)),
    },
    redis: {
      host: string('REDIS_HOST', developmentOnly('localhost')),
      port: int('REDIS_PORT', fallback(6379)),
      password: process.env.REDIS_AUTH_TOKEN,
      tls: bool('REDIS_TLS_ENABLED', fallback(false)),
    },
    session: {
      secret: string('SESSION_SECRET', developmentOnly('app-insecure-default-session')),
      expiryMinutes: int('WEB_SESSION_TIMEOUT_IN_MINUTES', fallback(120)),
    },
    apis: {
      auth: {
        enabled: true,
        url: authUrl,
        externalUrl: string('HMPPS_AUTH_EXTERNAL_URL', fallback(authUrl)),
        timeout: {
          response: int('HMPPS_AUTH_TIMEOUT_RESPONSE', fallback(10000)),
          deadline: int('HMPPS_AUTH_TIMEOUT_DEADLINE', fallback(10000)),
        },
        agent: defaultAgentConfig(),
        apiClientCredentials: {
          id: string('API_CLIENT_ID', developmentOnly('interventions')),
          secret: string('API_CLIENT_SECRET', developmentOnly('clientsecret')),
        },
        systemClientCredentials: {
          id: string('SYSTEM_CLIENT_ID', developmentOnly('interventions')),
          secret: string('SYSTEM_CLIENT_SECRET', developmentOnly('clientsecret')),
        },
      },
      tokenVerification: {
        enabled: bool('TOKEN_VERIFICATION_ENABLED', fallback(false)),
        url: string('TOKEN_VERIFICATION_API_URL', developmentOnly('http://localhost:8100')),
        timeout: {
          response: int('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', fallback(5000)),
          deadline: int('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', fallback(5000)),
        },
        agent: defaultAgentConfig(),
      },
    },
  };
}
