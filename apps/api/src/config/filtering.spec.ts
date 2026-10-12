import { BadRequestException } from '@nestjs/common';
import { FilteringParams } from './filtering';
import {
  fakeHttpContext,
  getParamDecoratorFactory,
} from 'src/test-utils/param-decorator';

describe('FilteringParams', () => {
  const factory = getParamDecoratorFactory(FilteringParams);
  const valid = ['name', 'role'];
  const run = (filter?: string, data: unknown = valid) =>
    factory(data, fakeHttpContext(filter === undefined ? {} : { filter }));

  it('returns null when no filter is supplied', () => {
    expect(run()).toBeNull();
  });

  it('parses property:rule:value', () => {
    expect(run('name:gt:5')).toEqual({
      property: 'name',
      rule: 'gt',
      value: '5',
    });
  });

  it('allows value-less isnull rule', () => {
    expect(run('name:isnull')).toEqual({
      property: 'name',
      rule: 'isnull',
      value: undefined,
    });
  });

  it('accepts comma separated values for in', () => {
    expect(run('role:in:a,b,c')).toMatchObject({ rule: 'in', value: 'a,b,c' });
  });

  it.each([
    'name',
    'name:gt',
    'name:gt:',
    'name:bogus:1',
    'na me:gt:1',
    'name:gt:a b',
  ])('rejects malformed filter %p', (filter) => {
    expect(() => run(filter)).toThrow(BadRequestException);
  });

  it('rejects properties outside the whitelist', () => {
    expect(() => run('password:gt:x')).toThrow(
      'Invalid filter property: password',
    );
  });

  it('rejects when the whitelist is not an object', () => {
    expect(() => run('name:gt:x', 'name')).toThrow(BadRequestException);
  });

  // KNOWN INCONSISTENCY (characterisation): the format regex admits
  // eq/neq/like/nlike/nin/isnotnull, but FilterRule contains
  // equals/not/search/notIn/..., so these always fail the second check.
  // Only gt, gte, lt, lte, in and isnull can currently get through.
  // FilteringParams is not used by any controller yet.
  it.each([
    'name:eq:x',
    'name:neq:x',
    'name:like:x',
    'name:nin:x',
    'name:isnotnull',
  ])(
    'rejects rules that pass the regex but are not FilterRule members: %p',
    (filter) => {
      expect(() => run(filter)).toThrow(/Invalid filter rule/);
    },
  );
});
