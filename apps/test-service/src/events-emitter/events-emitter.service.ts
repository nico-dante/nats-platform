import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Injectable } from '@nestjs/common';
import { MyLogger } from '../util/logging.util';
import { Codec, JSONCodec, PubAck } from 'nats';

@Injectable()
export class EventsEmitterService {
  private natsCodec: Codec<unknown>;

  constructor(
    private logger: MyLogger,
    private readonly natsClient: NatsJetStreamClientProxy,
  ) {
    this.logger.setContext(EventsEmitterService.name);
    this.natsCodec = JSONCodec();
  }

  async emit(title: string, content: Record<string, any>): Promise<PubAck> {
    const nc = await this.natsClient.connect();

    return nc.jetstream().publish(
      `testsvc.event.${title.toLocaleLowerCase().replaceAll(' ', '_')}`,
      this.natsCodec.encode({
        header: { title, createdAt: new Date() },
        payload: content,
      }),
    );
  }
}
