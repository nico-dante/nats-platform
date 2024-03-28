import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyLogger, logLevels } from './util/logging.util';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

async function bootstrap() {
  const httpApp = await NestFactory.create(AppModule);

  const logger = await httpApp.resolve(MyLogger);
  logger.setLogLevels(logLevels());

  httpApp.useLogger(logger);

  // Starts listening for shutdown hooks
  httpApp.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Test Service')
    .setDescription('The Test Service API')
    .setVersion(process.env.npm_package_version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(httpApp, config);
  SwaggerModule.setup('api', httpApp, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const natsJetStreamMS = httpApp.connectMicroservice({
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: `${process.env.NATS_SERVER_URL}`,
        token: `${process.env.NATS_TOKEN}`,
        name: `${process.env.NATS_EMITTER_CLIENT_ID}`,
      },
      consumerOptions: {
        deliverGroup: `${process.env.NATS_EVENTS_DELIVERY_GROUP}`,
        durable: `${process.env.NATS_EVENTS_DURABLE}`,
        deliverTo: `${process.env.NATS_EVENTS_DELIVERY_TO}`,
        manualAck: true,
      },
      streamConfig: [
        {
          name: `${process.env.NATS_EVENTS_STREAM}`,
          subjects: [`${process.env.NATS_EVENTS_SUBJECT}`],
        },
      ],
    }),
  });
  natsJetStreamMS.listen();

  const httpPort = Number.parseInt(process.env.HTTP_PORT || '3000');
  await httpApp.listen(httpPort, () =>
    logger.log(`HTTP App listening on port ${httpPort}`),
  );
}
bootstrap();
