import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';

const makeError = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError(
    'Invalid `prisma.user.create()` invocation in\n/app/src/users.ts:12',
    { code, clientVersion: 'test', meta },
  );

function setup(acceptLanguage?: string) {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host: any = {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { 'accept-language': acceptLanguage } }),
      getResponse: () => ({ status }),
    }),
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
    ['P2002', HttpStatus.CONFLICT, 'Already exists'],
    ['P2025', HttpStatus.NOT_FOUND, 'Not Found'],
    ['P2003', HttpStatus.BAD_REQUEST, 'A related record does not exist'],
    ['P2016', HttpStatus.BAD_REQUEST, 'Bad Request'],
    ['P2017', HttpStatus.BAD_REQUEST, 'The records are not connected'],
    [
      'P1008',
      HttpStatus.REQUEST_TIMEOUT,
      'The database did not respond in time',
    ],
    [
      'P1009',
      HttpStatus.REQUEST_TIMEOUT,
      'The database did not respond in time',
    ],
    [
      'P1011',
      HttpStatus.REQUEST_TIMEOUT,
      'The database did not respond in time',
    ],
  ])('maps %s to HTTP %i with a fixed message', (code, expected, message) => {
    const { filter, host, status, json } = setup();
    filter.catch(makeError(code), host);
    expect(status).toHaveBeenCalledWith(expected);
    expect(json).toHaveBeenCalledWith({ statusCode: expected, message });
  });

  it('names the fields of a violated unique constraint', () => {
    const { filter, host, json } = setup();
    filter.catch(makeError('P2002', { target: ['email'] }), host);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Already exists: email',
    });
  });

  it('answers in Croatian when the request asks for it', () => {
    const { filter, host, json } = setup('hr-HR,hr;q=0.9');
    filter.catch(makeError('P2002', { target: ['email'] }), host);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Već postoji: email',
    });
  });

  it('never passes on the Prisma message', () => {
    const { filter, host, json } = setup();
    filter.catch(makeError('P2025'), host);
    expect(JSON.stringify(json.mock.calls)).not.toContain('prisma');
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
