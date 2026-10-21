import { BadRequestException } from '@nestjs/common';
import { SortingParams } from './sorting';
import {
  fakeHttpContext,
  getParamDecoratorFactory,
} from 'src/test-utils/param-decorator';

describe('SortingParams', () => {
  const factory = getParamDecoratorFactory(SortingParams);
  const valid = ['name', 'createdAt'];

  it('returns null without attribute or direction', () => {
    expect(factory(valid, fakeHttpContext({}))).toBeNull();
    expect(factory(valid, fakeHttpContext({ attribute: 'name' }))).toBeNull();
    expect(factory(valid, fakeHttpContext({ direction: 'asc' }))).toBeNull();
  });

  it('returns the sorting request for a whitelisted attribute', () => {
    expect(
      factory(valid, fakeHttpContext({ attribute: 'name', direction: 'asc' })),
    ).toEqual({ attribute: 'name', direction: 'asc' });
  });

  it('rejects attributes that are not whitelisted', () => {
    expect(() =>
      factory(
        valid,
        fakeHttpContext({ attribute: 'password', direction: 'asc' }),
      ),
    ).toThrow('Invalid sort property: password');
  });

  it('rejects when the whitelist is not an array/object', () => {
    expect(() =>
      factory('name', fakeHttpContext({ attribute: 'name', direction: 'asc' })),
    ).toThrow(BadRequestException);
  });

  it('rejects attributes that do not start with alphanumerics', () => {
    expect(() =>
      factory(valid, fakeHttpContext({ attribute: '$$', direction: 'asc' })),
    ).toThrow(BadRequestException);
  });
});
