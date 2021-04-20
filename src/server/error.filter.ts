import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HealthError } from './health/types';

@Catch()
export class ErrorFilter<T extends Error> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HealthError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json(exception.health);
    }

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    switch (status) {
      case HttpStatus.FORBIDDEN:
        return response.redirect('/login');
      case HttpStatus.UNAUTHORIZED:
      case HttpStatus.NOT_FOUND:
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return response.status(status).render('pages/error', {
          message: exception.message,
          status,
          stack: exception.stack,
        });
    }
  }
}
