import { Module } from '@nestjs/common';
import { EventsListenerController } from './events-listener.controller';
import { MyLoggerModule } from '../util/logging.util';
import { NatsJetStreamTransport } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

@Module({
  imports: [
    MyLoggerModule,
    NatsJetStreamTransport.register({
      connectionOptions: {
        servers: `${process.env.NATS_SERVER_URL}`,
        token: `${process.env.NATS_TOKEN}`,
        name: `${process.env.NATS_EMITTER_CLIENT_ID}`,
      },
    }),
  ],
  controllers: [EventsListenerController],
})
export class EventsListenerModule {}
