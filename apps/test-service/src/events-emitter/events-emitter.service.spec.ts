import { Test, TestingModule } from '@nestjs/testing';
import { EventsEmitterService } from './events-emitter.service';
import { LOCAL_TEST_NODE_ENV } from '../util/common.util';
import { MyLoggerModule } from '../util/logging.util';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { mockNatsClient } from '../util/nats.mock';
import { JetStreamPublishOptions, Payload, PubAck } from 'nats';

describe('EventsEmitterService', () => {
  let service: EventsEmitterService;

  const originalEnv = process.env;

  let publishFn: (
    subj: string,
    payload?: Payload,
    options?: Partial<JetStreamPublishOptions>,
  ) => Promise<PubAck>;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: LOCAL_TEST_NODE_ENV,
    };

    publishFn = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      imports: [MyLoggerModule],
      providers: [
        EventsEmitterService,
        {
          provide: NatsJetStreamClientProxy,
          useValue: mockNatsClient(publishFn),
        },
      ],
    }).compile();

    service = module.get<EventsEmitterService>(EventsEmitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should emit event', async () => {
    await service.emit('test', { test: true });

    expect(publishFn).toHaveBeenCalledTimes(1);
  });
});
