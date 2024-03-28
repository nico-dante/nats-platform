import { Module, OnModuleInit } from '@nestjs/common';
import { EventsEmitterService } from './events-emitter.service';
import { MyLoggerModule } from '../util/logging.util';
import {
  NatsJetStreamClientProxy,
  NatsJetStreamTransport,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { EventsEmitterController } from './events-emitter.controller';
import { RetentionPolicy } from 'nats';

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
  controllers: [EventsEmitterController],
  providers: [EventsEmitterService],
})
export class EventsEmitterModule implements OnModuleInit {
  constructor(private readonly natsClient: NatsJetStreamClientProxy) {}

  async onModuleInit() {
    try {
      const nc = await this.natsClient.connect();
      const jsm = await nc.jetstreamManager();

      await jsm.streams.add({
        name: `${process.env.NATS_EVENTS_STREAM}`,
        subjects: [`${process.env.NATS_EVENTS_SUBJECT}`],
        retention: RetentionPolicy.Workqueue,
      });
    } catch (err) {
      console.error('error on init nats connection:', err);
    }
  }
}
