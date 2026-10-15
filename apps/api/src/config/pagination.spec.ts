import { BadRequestException } from '@nestjs/common';
import { PaginationParams } from './pagination';
import {
  fakeHttpContext,
  getParamDecoratorFactory,
} from 'src/test-utils/param-decorator';

describe('PaginationParams', () => {
  const run = (query: Record<string, string>) =>
    getParamDecoratorFactory(PaginationParams)(
      undefined,
      fakeHttpContext(query),
    );

  it('defaults to page 1, size 10 when params are missing', () => {
    expect(run({})).toEqual({ page: 1, size: 10 });
  });

  it('defaults when only one of the params is given', () => {
    expect(run({ page: '3' })).toEqual({ page: 1, size: 10 });
    expect(run({ size: '3' })).toEqual({ page: 1, size: 10 });
  });

  it('defaults for non-numeric input (NaN is falsy)', () => {
    expect(run({ page: 'x', size: 'y' })).toEqual({ page: 1, size: 10 });
  });

  it('parses valid values', () => {
    expect(run({ page: '2', size: '25' })).toEqual({ page: 2, size: 25 });
  });

  it('accepts the maximum size of 100', () => {
    expect(run({ page: '1', size: '100' })).toEqual({ page: 1, size: 100 });
  });

  it('rejects sizes above 100', () => {
    expect(() => run({ page: '1', size: '101' })).toThrow(BadRequestException);
  });

  it.each([
    ['-1', '10'],
    ['1', '-5'],
  ])('rejects negative values (page=%s size=%s)', (page, size) => {
    expect(() => run({ page, size })).toThrow(BadRequestException);
  });
});
