import { SavedWorksService } from './saved-works.service';
import { describeToggleService } from 'src/test-utils/toggle-service.spec-helper';

describeToggleService({
  name: 'SavedWorksService',
  build: (p) => new SavedWorksService(p),
  model: 'savedWorks',
  fk: 'workId',
  compositeKey: 'workId_userId',
  findAllForUser: 'findAllForUser',
  findAllForTarget: 'findAllForwork',
});
