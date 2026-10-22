import { Module } from '@nestjs/common';
import { MembersModule } from 'src/members/members.module';
import { VansyClient } from './vansy.client';
import { VANSY_CONFIG, readVansyConfig } from './vansy.config';
import { VansyController, VansyWebhookController } from './vansy.controller';
import { VansyService } from './vansy.service';

@Module({
  imports: [MembersModule],
  controllers: [VansyController, VansyWebhookController],
  providers: [
    { provide: VANSY_CONFIG, useFactory: () => readVansyConfig() },
    VansyClient,
    VansyService,
  ],
})
export class VansyModule {}
