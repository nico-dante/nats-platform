import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerMiddleware, MyLoggerModule } from './util/logging.util';
import { EventsEmitterModule } from './events-emitter/events-emitter.module';
import { EventsListenerModule } from './events-listener/events-listener.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrometheusModule.register(),
    MyLoggerModule,
    EventsEmitterModule,
    EventsListenerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
