import { Test, TestingModule } from '@nestjs/testing';
import { EventsEmitterService } from './events-emitter.service';
import { LOCAL_TEST_NODE_ENV } from '../util/common.util';
import { MyLoggerModule } from '../util/logging.util';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { mockNatsClient } from '../util/nats.mock';

describe('EventsEmitterService', () => {
  let service: EventsEmitterService;

  const originalEnv = process.env;

  let sendFn: () => void;
  let emitFn: () => void;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: LOCAL_TEST_NODE_ENV,
    };

    sendFn = jest.fn();
    emitFn = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      imports: [MyLoggerModule],
      providers: [
        EventsEmitterService,
        {
          provide: NatsJetStreamClientProxy,
          useValue: mockNatsClient(sendFn, emitFn),
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

    expect(sendFn).toHaveBeenCalledTimes(0);
    expect(emitFn).toHaveBeenCalledTimes(1);
  });
});
