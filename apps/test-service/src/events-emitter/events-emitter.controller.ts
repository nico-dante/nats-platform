import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MyLogger } from '../util/logging.util';
import { EventsEmitterService } from './events-emitter.service';
import { NewEventDto } from './events-emitter.dto';
import { validateDto } from '../util/common.util';

@ApiTags('Events Emitter')
@Controller('events-emitter')
export class EventsEmitterController {
  constructor(
    private readonly logger: MyLogger,
    private readonly eventsEmitterService: EventsEmitterService,
  ) {
    this.logger.setContext(EventsEmitterController.name);
  }

  @Post()
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'the body is not correct',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event is emitted.',
  })
  async emit(@Body() dto: NewEventDto): Promise<any> {
    const validateResp = await validateDto(dto, NewEventDto);
    if (validateResp.hasErrors()) {
      this.logger.error(
        `body of create user is not valid: ${JSON.stringify(validateResp.errorsMap())}`,
      );
      throw new BadRequestException('the body is not correct', {
        cause: validateResp.errorsMap(),
      });
    }

    return this.eventsEmitterService.emit(dto.title, dto.content);
  }
}
