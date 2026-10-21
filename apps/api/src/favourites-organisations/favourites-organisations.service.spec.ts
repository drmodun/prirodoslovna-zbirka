import { FavouriteOrganisationsService } from './favourites-organisations.service';
import { describeToggleService } from 'src/test-utils/toggle-service.spec-helper';

describeToggleService({
  name: 'FavouriteOrganisationsService',
  build: (p) => new FavouriteOrganisationsService(p),
  model: 'userOrganisationFollower',
  fk: 'organisationId',
  compositeKey: 'organisationId_userId',
  findAllForUser: 'findAllForUser',
  findAllForTarget: 'findAllForOrganisation',
});
