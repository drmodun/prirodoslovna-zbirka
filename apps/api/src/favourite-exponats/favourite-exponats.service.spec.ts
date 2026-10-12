import { FavouriteExponatsService } from './favourite-exponats.service';
import { describeToggleService } from 'src/test-utils/toggle-service.spec-helper';

describeToggleService({
  name: 'FavouriteExponatsService',
  build: (p) => new FavouriteExponatsService(p),
  model: 'favouriteExponat',
  fk: 'ExponatId',
  compositeKey: 'ExponatId_userId',
  findAllForUser: 'findAllForUser',
  findAllForTarget: 'findAllForExponat',
});
