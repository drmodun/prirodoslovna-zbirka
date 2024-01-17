import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MembersController],
  providers: [MembersService, PrismaService],
  imports: [PrismaModule],
})
export class MembersModule {}
