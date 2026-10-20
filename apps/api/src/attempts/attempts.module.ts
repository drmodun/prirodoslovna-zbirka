import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [MembersModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
