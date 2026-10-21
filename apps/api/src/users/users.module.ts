import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BlobModule } from 'src/blob/blob.module';

@Module({
  controllers: [UsersController],
  imports: [BlobModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
