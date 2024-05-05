import { Module } from '@nestjs/common';
import { SavedWorksService } from './saved-works.service';
import { SavedWorksController } from './saved-works.controller';

@Module({
  controllers: [SavedWorksController],
  providers: [SavedWorksService]
})
export class SavedWorksModule {}
