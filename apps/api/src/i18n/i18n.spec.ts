import {
  BadRequestException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { translateErrorMessage } from './error-messages';
import { LocalisedExceptionFilter } from './localised-exception.filter';
import { requestLanguage } from './request-language';

describe('requestLanguage', () => {
  it.each([
    ['hr', 'HR'],
    ['hr-HR,hr;q=0.9,en;q=0.8', 'HR'],
    ['en', 'EN'],
    ['en-US,hr;q=0.5', 'EN'],
    [undefined, 'EN'],
    ['', 'EN'],
  ])('%s -> %s', (header, language) => {
    expect(requestLanguage(header)).toBe(language);
  });
});

describe('translateErrorMessage', () => {
  it('leaves English untouched', () => {
    expect(translateErrorMessage('Invalid credentials', 'EN')).toBe(
      'Invalid credentials',
    );
  });

  it('translates known messages and Nest defaults to Croatian', () => {
    expect(translateErrorMessage('Invalid credentials', 'HR')).toBe(
      'Neispravni podaci za prijavu',
    );
    expect(translateErrorMessage('Unauthorized', 'HR')).toBe(
      'Niste prijavljeni ili nemate ovlasti',
    );
  });

  it('translates messages that carry a value, including validation ones', () => {
    expect(translateErrorMessage('Invalid sort property: foo', 'HR')).toBe(
      'Neispravno svojstvo sortiranja: foo',
    );
    expect(translateErrorMessage('email must be an email', 'HR')).toBe(
      'email mora biti ispravna e-mail adresa',
    );
    expect(
      translateErrorMessage(
        'firstName must be longer than or equal to 2 characters',
        'HR',
      ),
    ).toBe('firstName mora imati barem 2 znakova');
    expect(
      translateErrorMessage('You can have at most 10 active API tokens', 'HR'),
    ).toBe('Možete imati najviše 10 aktivnih API tokena');
    expect(
      translateErrorMessage('expiresInDays must not be greater than 365', 'HR'),
    ).toBe('expiresInDays ne smije biti veće od 365');
  });

  it('keeps unknown messages as they are', () => {
    expect(translateErrorMessage('Something odd', 'HR')).toBe('Something odd');
  });
});

describe('LocalisedExceptionFilter', () => {
  const setup = (acceptLanguage?: string) => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'accept-language': acceptLanguage } }),
        getResponse: () => ({ status }),
      }),
    };
    const filter = new LocalisedExceptionFilter({ reply: jest.fn() } as any);
    return { filter, host, status, json };
  };
  afterEach(() => jest.restoreAllMocks());

  it('answers Croatian requests in Croatian', () => {
    const { filter, host, status, json } = setup('hr');
    filter.catch(new BadRequestException('Invalid credentials'), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Neispravni podaci za prijavu',
      error: 'Neispravan zahtjev',
    });
  });

  it('translates every validation message', () => {
    const { filter, host, json } = setup('hr-HR');
    filter.catch(
      new BadRequestException(['email must be an email', 'odd one']),
      host,
    );
    expect(json.mock.calls[0][0].message).toEqual([
      'email mora biti ispravna e-mail adresa',
      'odd one',
    ]);
  });

  it('translates default messages', () => {
    const { filter, host, json } = setup('hr');
    filter.catch(new UnauthorizedException(), host);
    expect(json.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: 'Niste prijavljeni ili nemate ovlasti',
    });
  });

  it('leaves other requests to the default filter', () => {
    const base = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation();
    const { filter, host, status } = setup('en');
    filter.catch(new BadRequestException('Invalid credentials'), host);
    expect(base).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });
});
