import { Module } from '@nestjs/common';
import { SavedLiteratureService } from './literature.service';
import { LiteratureController } from './literature.controller';

@Module({
  controllers: [LiteratureController],
  providers: [SavedLiteratureService],
})
export class LiteratureModule {}
