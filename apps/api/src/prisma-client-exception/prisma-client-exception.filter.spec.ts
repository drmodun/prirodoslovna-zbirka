import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';

const makeError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('Some\nmessage', {
    code,
    clientVersion: 'test',
  });

function setup() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host: any = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  };
  const filter = new PrismaClientExceptionFilter({ reply: jest.fn() } as any);
  return { json, status, host, filter };
}

describe('PrismaClientExceptionFilter', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['P2002', HttpStatus.CONFLICT],
    ['P2025', HttpStatus.NOT_FOUND],
    ['P2003', HttpStatus.BAD_REQUEST],
    ['P2016', HttpStatus.BAD_REQUEST],
    ['P2017', HttpStatus.BAD_REQUEST],
    ['P1008', HttpStatus.REQUEST_TIMEOUT],
    ['P1009', HttpStatus.REQUEST_TIMEOUT],
    ['P1011', HttpStatus.REQUEST_TIMEOUT],
  ])('maps %s to HTTP %i', (code, expected) => {
    const { filter, host, status, json } = setup();
    filter.catch(makeError(code), host);
    expect(status).toHaveBeenCalledWith(expected);
    expect(json).toHaveBeenCalledWith({
      statusCode: expected,
      message: 'Somemessage', // newlines are stripped
    });
  });

  it('falls back to the base filter (500) for unknown codes', () => {
    const { filter, host, status } = setup();
    const spy = jest
      .spyOn(
        Object.getPrototypeOf(PrismaClientExceptionFilter.prototype),
        'catch',
      )
      .mockImplementation();
    filter.catch(makeError('P9999'), host);
    expect(status).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });
});
