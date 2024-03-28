import { Controller, Get } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { EventDetails } from '../util/common.util';
import { MyLogger } from '../util/logging.util';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Events Listener')
@Controller('events-listener')
export class EventsListenerController {
  private events: Array<{ subject: string; payload: EventDetails }> = [];

  constructor(private readonly logger: MyLogger) {
    this.logger.setContext(EventsListenerController.name);
  }

  @Get('received')
  listEvents() {
    return this.events;
  }

  @EventPattern('testsvc.event.*')
  async eventHandler(
    @Payload() payload: EventDetails,
    @Ctx() ctx: NatsJetStreamContext,
  ) {
    this.logger.log(
      `received event [${ctx.message.subject}]: ${JSON.stringify(payload)}`,
    );

    this.events.push({
      subject: ctx.message.subject,
      payload,
    });

    ctx.message.ack();
  }
}
