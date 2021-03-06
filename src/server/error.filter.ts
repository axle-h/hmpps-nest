import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HealthError } from './health/types';
import { ValidationException } from './validation';

/**
 * TODO break this up and move into respective modules.
 */
@Catch()
export class ErrorFilter<T extends Error> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HealthError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json(exception.health);
    }

    if (exception instanceof ValidationException) {
      return response.status(HttpStatus.BAD_REQUEST).render(exception.template, exception.viewModel);
    }

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    switch (status) {
      case HttpStatus.FORBIDDEN:
        return response.redirect('/login');
      default:
        return response.status(status).render('pages/error', {
          message: exception.message,
          status,
          stack: exception.stack,
        });
    }
  }
}
