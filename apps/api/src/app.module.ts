import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchemaForEnv } from './config/environment-variables';
import { PrismaModule } from './prisma/prisma.module';
import { OrganisationsModule } from './organisations/organisations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchemaForEnv,
    }),
    PrismaModule,
    OrganisationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
