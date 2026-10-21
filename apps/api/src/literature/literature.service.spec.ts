import { SavedLiteratureService } from './literature.service';
import { describeToggleService } from 'src/test-utils/toggle-service.spec-helper';

describeToggleService({
  name: 'SavedLiteratureService',
  build: (p) => new SavedLiteratureService(p),
  model: 'savedLiterature',
  fk: 'literatureId',
  compositeKey: 'literatureId_userId',
  findAllForUser: 'findAllForUser',
  findAllForTarget: 'findAllForLiterature',
});
