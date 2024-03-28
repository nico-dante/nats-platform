import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LOCAL_TEST_NODE_ENV } from './../src/util/common.util';
import { JetStreamPublishOptions, Payload, PubAck } from 'nats';
import { MyLoggerModule } from './../src/util/logging.util';
import { EventsListenerController } from './../src/events-listener/events-listener.controller';
import { AppController } from './../src/app.controller';
import { EventsEmitterController } from './../src/events-emitter/events-emitter.controller';
import { EventsEmitterService } from './../src/events-emitter/events-emitter.service';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { mockNatsClient } from './../src/util/nats.mock';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

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

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MyLoggerModule],
      controllers: [
        AppController,
        EventsEmitterController,
        EventsListenerController,
      ],
      providers: [
        AppService,
        EventsEmitterService,
        {
          provide: NatsJetStreamClientProxy,
          useValue: mockNatsClient(publishFn),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Test Service');
  });
});
