import { Test, TestingModule } from '@nestjs/testing';
import { EventsListenerController } from './events-listener.controller';
import { JetStreamPublishOptions, Payload, PubAck } from 'nats';
import { LOCAL_TEST_NODE_ENV } from '../util/common.util';
import { MyLogger, MyLoggerModule } from '../util/logging.util';
import {
  NatsJetStreamClientProxy,
  NatsJetStreamContext,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { mockNatsClient } from '../util/nats.mock';

describe('EventsListenerController', () => {
  let controller: EventsListenerController;

  const originalEnv = process.env;

  const mockAppLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),

    setContext: jest.fn(),
  };

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
      controllers: [EventsListenerController],
      providers: [
        {
          provide: NatsJetStreamClientProxy,
          useValue: mockNatsClient(publishFn),
        },
      ],
    })
      .overrideProvider(MyLogger)
      .useValue(mockAppLoggerService)
      .compile();

    controller = module.get<EventsListenerController>(EventsListenerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an empty list of events', () => {
    expect(controller.listEvents()).toStrictEqual([]);
  });

  it('should return a non empty list of events', () => {
    const now = new Date();

    const payload = {
      header: { title: 'test', createdAt: now },
      payload: { test: true },
    };
    const subject = 'my-test-event';

    controller.eventHandler(payload, {
      message: { subject, ack: jest.fn() },
    } as unknown as NatsJetStreamContext);

    expect(controller.listEvents().length).toBeGreaterThan(0);
    expect(mockAppLoggerService.log).toHaveBeenCalledTimes(1);
    expect(mockAppLoggerService.log).toHaveBeenCalledWith(
      `received event [${subject}]: ${JSON.stringify(payload)}`,
    );
  });
});
