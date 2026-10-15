describe('EmailService', () => {
  const sendMail = jest.fn().mockResolvedValue('smtp-ok');
  const sgSend = jest.fn().mockResolvedValue('sg-ok');
  const setApiKey = jest.fn();
  const createTransport = jest.fn(() => ({ sendMail }));

  /** EmailService reads process.env at construction, so load it fresh. */
  function load(env: Record<string, string | undefined>) {
    jest.resetModules();
    jest.doMock('nodemailer', () => ({ createTransport }));
    jest.doMock('@sendgrid/mail', () => ({ send: sgSend, setApiKey }));
    for (const k of ['SMTP_URL', 'SENDGRID_API_KEY', 'MAIL_FROM'])
      delete process.env[k];
    Object.assign(process.env, env);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { EmailService } = require('./email.service');
    return new EmailService();
  }

  beforeEach(() => jest.clearAllMocks());

  it('uses SMTP when SMTP_URL is set, even if SendGrid is configured', async () => {
    const svc = load({
      SMTP_URL: 'smtp://x',
      SENDGRID_API_KEY: 'k',
      MAIL_FROM: 'a@b.c',
    });
    await expect(svc.sendMail('to@x', 'subj', 'body')).resolves.toBe('smtp-ok');
    expect(createTransport).toHaveBeenCalledWith('smtp://x');
    expect(sendMail).toHaveBeenCalledWith({
      to: 'to@x',
      from: 'a@b.c',
      subject: 'subj',
      text: 'body',
    });
    expect(sgSend).not.toHaveBeenCalled();
    expect(setApiKey).not.toHaveBeenCalled();
  });

  it('uses SendGrid when only the API key is set', async () => {
    const svc = load({ SENDGRID_API_KEY: 'key' });
    await expect(svc.sendMail('to@x', 's', 't')).resolves.toBe('sg-ok');
    expect(setApiKey).toHaveBeenCalledWith('key');
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('only logs (and sends nothing) when no provider is configured', async () => {
    const svc = load({});
    await expect(svc.sendMail('to@x', 's', 't')).resolves.toBeUndefined();
    expect(sendMail).not.toHaveBeenCalled();
    expect(sgSend).not.toHaveBeenCalled();
  });

  it('falls back to the default sender when MAIL_FROM is unset', async () => {
    const svc = load({ SMTP_URL: 'smtp://x' });
    await svc.sendMail('to@x', 's', 't');
    expect(sendMail.mock.calls[0][0].from).toBe('biosfera.trema@gmail.com');
  });
});
