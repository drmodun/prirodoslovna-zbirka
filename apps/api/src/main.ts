import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { configureApp } from './app.setup';

async function bootstrap() {
  // The raw body is kept for verifying signed webhooks (Vansy).
  const app = await NestFactory.create(AppModule, { rawBody: true });
  configureApp(app);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Biosfera API')
    .setDescription('Api za aplikaciju biosfere')
    .setVersion('0.1')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      description:
        'A login token from POST /auth/login (JWT, 24 hours) or a personal access token (bsf_…) from POST /auth/tokens. Tokens are refused where a login is required (managing tokens, deleting the account).',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  BigInt.prototype['toJSON'] = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  await app.listen(Number(process.env.PORT) || 5500);
}
bootstrap();
