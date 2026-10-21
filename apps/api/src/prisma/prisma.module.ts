import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global so that every module shares one client (and one connection pool)
// instead of providing its own PrismaService.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
