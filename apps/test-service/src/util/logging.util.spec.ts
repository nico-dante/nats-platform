import { Test, TestingModule } from '@nestjs/testing';
import {
  LoggerMiddleware,
  MyLogger,
  MyLoggerModule,
  logLevels,
} from './logging.util';
import { ExpressMock } from './express.mock';
import EventEmitter from 'events';
import { AppService } from '../app.service';
import { AppController } from '../app.controller';

describe('MyLogger', () => {
  const originalEnv = process.env;

  const mockConsoleLog = jest.fn();

  let logger: MyLogger;

  beforeEach(async () => {
    jest.resetModules();

    process.env = {
      ...originalEnv,
      LOG_LEVELS: 'error, log, test',
    };

    process.stdout.write = mockConsoleLog;

    const app: TestingModule = await Test.createTestingModule({
      providers: [MyLogger],
    }).compile();

    logger = await app.resolve<MyLogger>(MyLogger);
    logger.setContext('TestSuite');
  });

  it('should be definde', () => {
    expect(logger).toBeDefined();
  });

  it('should be the correct log levels', () => {
    expect(logLevels()).toStrictEqual(['error', 'log']);
  });

  it('should log with format', () => {
    logger.log('test');

    expect(mockConsoleLog).toHaveBeenCalledTimes(1);
  });
});

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;

  const expressMock = new ExpressMock();

  const mockAppLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),

    setContext: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MyLoggerModule],
      controllers: [AppController],
      providers: [AppService, LoggerMiddleware],
    })
      .overrideProvider(MyLogger)
      .useValue(mockAppLoggerService)
      .compile();

    middleware = module.get<LoggerMiddleware>(LoggerMiddleware);

    expressMock.initMocks(
      {
        method: 'GET',
        protocol: 'http',
        hostname: 'test-host',
        url: '/test/url',
        headers: { accept: 'application/json', 'user-agent': 'jest' },
      },
      { eventEmitter: EventEmitter },
    );
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should trigger the next function', async () => {
    const req = expressMock.getRequest();
    const res = expressMock.getResponse();
    const nextFn = expressMock.getNextFunction();
    middleware.use(req, res, nextFn);
    expect(nextFn).toHaveBeenCalledTimes(1);

    // const buf = Buffer.from('data sent in request', 'utf-8');
    // res.write(buf);
    // res.end();

    // expect(mockAppLoggerService.debug).toHaveBeenCalledTimes(2);
    // expect(mockAppLoggerService.debug).toHaveBeenCalledWith(
    //   'Request: GET http://test-host/test/url body: {} headers: {"accept":"application/json","user-agent":"jest"} - jest 127.0.0.1',
    //   `Response: GET http://test-host/test/url 200 ${buf.length} - jest 127.0.0.1`,
    // );

    expect(mockAppLoggerService.debug).toHaveBeenCalledTimes(1);
    expect(mockAppLoggerService.debug).toHaveBeenCalledWith(
      'Request: GET http://test-host/test/url body: {} headers: {"accept":"application/json","user-agent":"jest"} - jest 127.0.0.1',
    );
  });
});
