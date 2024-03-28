import { Test, TestingModule } from '@nestjs/testing';
import { EventsEmitterController } from './events-emitter.controller';
import { MyLoggerModule } from '../util/logging.util';
import { EventsEmitterService } from './events-emitter.service';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { mockNatsClient } from '../util/nats.mock';
import { LOCAL_TEST_NODE_ENV } from '../util/common.util';
import { JetStreamPublishOptions, Payload, PubAck } from 'nats';

describe('EventsEmitterController', () => {
  let controller: EventsEmitterController;

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
      controllers: [EventsEmitterController],
      providers: [
        EventsEmitterService,
        {
          provide: NatsJetStreamClientProxy,
          useValue: mockNatsClient(publishFn),
        },
      ],
    }).compile();

    controller = module.get<EventsEmitterController>(EventsEmitterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should emit event', async () => {
    await controller.emit({ title: 'test', content: { test: true } });

    expect(publishFn).toHaveBeenCalledTimes(1);
  });

  it('should not emit event', async () => {
    let error: Error;
    try {
      await controller.emit({ title: undefined, content: undefined });
    } catch (err) {
      error = err;
    }

    expect(publishFn).toHaveBeenCalledTimes(0);
    expect(error).toBeDefined();
    expect(error.message).toBe('the body is not correct');
  });
});
