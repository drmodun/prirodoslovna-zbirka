import { Module } from '@nestjs/common';
import { SavedLiteratureService } from './literature.service';
import { LiteratureController } from './literature.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LiteratureController],
  providers: [PrismaService, SavedLiteratureService],
  imports: [PrismaModule],
})
export class LiteratureModule {}
