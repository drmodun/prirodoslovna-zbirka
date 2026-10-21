import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('returns the hello payload', async () => {
    const controller = new AppController(new AppService());
    await expect(controller.getHello()).resolves.toEqual({
      message: 'Hello World',
    });
  });
});
