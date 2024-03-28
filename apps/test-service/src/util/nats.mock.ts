import { Observable, of } from 'rxjs';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

export const mockNatsClient = (
  sendFn: (pattern: any, data: any) => void,
  emitFn: (pattern: any, data: any) => void,
): NatsJetStreamClientProxy => {
  const client = NatsJetStreamClientProxy.prototype;

  client.send = jest
    .fn()
    .mockImplementation(
      <TResult = any, TInput = any>(
        pattern: any,
        data: TInput,
      ): Observable<TResult> => {
        if (sendFn) {
          sendFn(pattern, data);
        }

        return of({} as TResult);
      },
    );

  client.emit = jest
    .fn()
    .mockImplementation(
      <TResult = any, TInput = any>(
        pattern: any,
        data: TInput,
      ): Observable<TResult> => {
        if (emitFn) {
          emitFn(pattern, data);
        }

        return of({} as TResult);
      },
    );

  return client;
};
