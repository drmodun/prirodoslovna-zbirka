import { Test, TestingModule } from '@nestjs/testing';
import { NotificationUsersService } from './notification-users.service';

describe('NotificationUsersService', () => {
  let service: NotificationUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationUsersService],
    }).compile();

    service = module.get<NotificationUsersService>(NotificationUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
