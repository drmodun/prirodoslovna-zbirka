import { Test, TestingModule } from '@nestjs/testing';
import { NotificationUsersController } from './notification-users.controller';
import { NotificationUsersService } from './notification-users.service';

describe('NotificationUsersController', () => {
  let controller: NotificationUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationUsersController],
      providers: [NotificationUsersService],
    }).compile();

    controller = module.get<NotificationUsersController>(NotificationUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
