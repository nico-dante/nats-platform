import { Test, TestingModule } from '@nestjs/testing';
import { EventsListenerController } from './events-listener.controller';

describe('EventsListenerController', () => {
  let controller: EventsListenerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsListenerController],
    }).compile();

    controller = module.get<EventsListenerController>(EventsListenerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
