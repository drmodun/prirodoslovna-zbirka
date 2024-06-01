import { Module } from '@nestjs/common';
import { AuthorshipInfoService } from './authorship-info.service';
import { AuthorshipInfoController } from './authorship-info.controller';

@Module({
  controllers: [AuthorshipInfoController],
  providers: [AuthorshipInfoService]
})
export class AuthorshipInfoModule {}
