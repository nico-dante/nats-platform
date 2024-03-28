/* eslint-disable @typescript-eslint/no-unused-vars */
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import {
  ConsumerOpts,
  ConsumerOptsBuilder,
  Consumers,
  JetStreamClient,
  JetStreamManager,
  JetStreamManagerOptions,
  JetStreamOptions,
  JetStreamPublishOptions,
  JetStreamPullSubscription,
  JetStreamSubscription,
  JsMsg,
  Msg,
  NatsConnection,
  Payload,
  PubAck,
  PublishOptions,
  PullOptions,
  QueuedIterator,
  RequestManyOptions,
  RequestOptions,
  ServerInfo,
  ServicesAPI,
  Stats,
  Status,
  Streams,
  Subscription,
  SubscriptionOptions,
  Views,
} from 'nats';

class MyNatsConnection implements NatsConnection {
  info?: ServerInfo;
  closed(): Promise<void | Error> {
    throw new Error('Method not implemented.');
  }
  close(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  publish(subject: string, payload?: Payload, options?: PublishOptions): void {
    throw new Error('Method not implemented.');
  }
  subscribe(subject: string, opts?: SubscriptionOptions): Subscription {
    throw new Error('Method not implemented.');
  }
  request(
    subject: string,
    payload?: Payload,
    opts?: RequestOptions,
  ): Promise<Msg> {
    throw new Error('Method not implemented.');
  }
  requestMany(
    subject: string,
    payload?: Payload,
    opts?: Partial<RequestManyOptions>,
  ): Promise<AsyncIterable<Msg>> {
    throw new Error('Method not implemented.');
  }
  flush(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  drain(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  isClosed(): boolean {
    throw new Error('Method not implemented.');
  }
  isDraining(): boolean {
    throw new Error('Method not implemented.');
  }
  getServer(): string {
    throw new Error('Method not implemented.');
  }
  status(): AsyncIterable<Status> {
    throw new Error('Method not implemented.');
  }
  stats(): Stats {
    throw new Error('Method not implemented.');
  }
  jetstreamManager(opts?: JetStreamManagerOptions): Promise<JetStreamManager> {
    throw new Error('Method not implemented.');
  }
  jetstream(opts?: JetStreamOptions): JetStreamClient {
    throw new Error('Method not implemented.');
  }
  rtt(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  services: ServicesAPI;
  reconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

class MyJetStreamClient implements JetStreamClient {
  publish(
    subj: string,
    payload?: Payload,
    options?: Partial<JetStreamPublishOptions>,
  ): Promise<PubAck> {
    throw new Error('Method not implemented.');
  }
  pull(stream: string, consumer: string, expires?: number): Promise<JsMsg> {
    throw new Error('Method not implemented.');
  }
  fetch(
    stream: string,
    durable: string,
    opts?: Partial<PullOptions>,
  ): QueuedIterator<JsMsg> {
    throw new Error('Method not implemented.');
  }
  pullSubscribe(
    subject: string,
    opts: ConsumerOptsBuilder | Partial<ConsumerOpts>,
  ): Promise<JetStreamPullSubscription> {
    throw new Error('Method not implemented.');
  }
  subscribe(
    subject: string,
    opts: ConsumerOptsBuilder | Partial<ConsumerOpts>,
  ): Promise<JetStreamSubscription> {
    throw new Error('Method not implemented.');
  }
  views: Views;
  apiPrefix: string;
  consumers: Consumers;
  streams: Streams;
  jetstreamManager(checkAPI?: boolean): Promise<JetStreamManager> {
    throw new Error('Method not implemented.');
  }
  getOptions(): JetStreamOptions {
    throw new Error('Method not implemented.');
  }
}

export const mockNatsClient = (
  publishFn: (
    subj: string,
    payload?: Payload,
    options?: Partial<JetStreamPublishOptions>,
  ) => Promise<PubAck>,
): NatsJetStreamClientProxy => {
  const jetStreamClientMock = MyJetStreamClient.prototype;
  jetStreamClientMock.publish = jest.fn().mockImplementation(publishFn);

  const natsConnMock = MyNatsConnection.prototype;
  natsConnMock.jetstream = jest
    .fn()
    .mockImplementation(
      (opts?: JetStreamOptions): JetStreamClient => jetStreamClientMock,
    );

  const client = NatsJetStreamClientProxy.prototype;
  client.connect = jest
    .fn()
    .mockImplementation(async (): Promise<NatsConnection> => natsConnMock);

  return client;
};
