import {
  Injectable,
  ConsoleLogger,
  Module,
  Scope,
  LogLevel,
  NestMiddleware,
} from '@nestjs/common';
import * as moment from 'moment';
import { Request, Response, NextFunction } from 'express';

export const logLevels = (): Array<LogLevel> =>
  (process.env.LOG_LEVELS || 'error,warn')
    .split(',')
    .map((l) => l.trim().toLocaleLowerCase())
    .filter((l) =>
      [
        'query',
        'error',
        'schema',
        'warn',
        'info',
        'log',
        'debug',
        'verbose',
      ].includes(l),
    )
    .map((l) => l as LogLevel);

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  constructor() {
    super();
  }

  protected getTimestamp(): string {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }
}

@Module({
  imports: [],
  providers: [MyLogger],
  exports: [MyLogger],
})
export class MyLoggerModule {}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: MyLogger) {
    logger.setContext(LoggerMiddleware.name);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, protocol, hostname, originalUrl, body, headers } = req;
    const userAgent = req.get('user-agent') || '';

    this.logger.debug(
      `Request: ${method} ${protocol}://${hostname}${originalUrl} body: ${JSON.stringify(
        body,
      )} headers: ${JSON.stringify(headers)} - ${userAgent} ${ip}`,
    );

    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      this.logger.debug(
        `Response: ${method} ${protocol}://${hostname}${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
