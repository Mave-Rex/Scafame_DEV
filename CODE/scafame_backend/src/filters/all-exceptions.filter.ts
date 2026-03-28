import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Clave duplicada en Postgres
    if (exception.code === '23505') {
      return response.status(400).json({
        statusCode: 400,
        message: 'Ya existe un registro con ese valor único.',
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      return response.status(status).json(typeof message === 'string' ? { message } : message);
    }

    // Error no manejado
    console.error(exception);

    return response.status(500).json({
      statusCode: 500,
      message: 'Error interno del servidor',
    });
  }
}
