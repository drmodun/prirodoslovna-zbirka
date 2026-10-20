import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { QuestionsController } from './questions.controller';

const question = (over: any = {}) => ({
  id: 'x1',
  question: '?',
  questionType: 'SINGLE',
  correct: ['a'],
  options: ['a', 'b'],
  image: 'i',
  points: 5,
  timeLimit: 10,
  ...over,
});

describe('QuestionsController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: QuestionsController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      hasEditPermission: jest.fn(),
      hasQuizEditPermission: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new QuestionsController(svc as any);
  });

  describe('permission gated writes', () => {
    const calls: [string, () => Promise<unknown>, string][] = [
      ['create', () => controller.create({} as any, 'q1', req), 'create'],
      ['update', () => controller.update('x1', {} as any, req, 'q1'), 'update'],
      ['remove', () => controller.remove('x1', req, 'q1'), 'remove'],
    ];

    it.each(calls)(
      '%s rejects users without edit permission',
      async (_n, call, method) => {
        svc.hasEditPermission.mockResolvedValue(false);
        svc.hasQuizEditPermission.mockResolvedValue(false);
        await expect(call()).rejects.toBeInstanceOf(UnauthorizedException);
        expect(svc[method]).not.toHaveBeenCalled();
      },
    );

    it.each(calls)(
      '%s delegates for users with permission',
      async (_n, call, method) => {
        svc.hasEditPermission.mockResolvedValue(true);
        svc.hasQuizEditPermission.mockResolvedValue(true);
        await call();
        expect(svc[method]).toHaveBeenCalled();
      },
    );

    it('create pins the question to the quiz in the URL', async () => {
      svc.hasQuizEditPermission.mockResolvedValue(true);
      const dto: any = { quizId: 'spoofed' };
      await controller.create(dto, 'q1', req);
      expect(svc.create).toHaveBeenCalledWith(
        expect.objectContaining({ quizId: 'q1' }),
      );
    });
  });

  it('checks edit permission against a question id, within its quiz', async () => {
    svc.hasEditPermission.mockResolvedValue(true);
    await controller.update('x1', {} as any, req, 'q1');
    expect(svc.hasEditPermission).toHaveBeenCalledWith('x1', 'me', 'q1');
  });

  it('create checks the rights on the quiz', async () => {
    svc.hasQuizEditPermission.mockResolvedValue(true);
    await controller.create({} as any, 'q1', req);
    expect(svc.hasQuizEditPermission).toHaveBeenCalledWith('q1', 'me');
  });

  it('findAll maps questions', async () => {
    svc.findAll.mockResolvedValue([question()]);
    const [res] = await controller.findAll({} as any);
    expect(res).toMatchObject({ id: 'x1', points: 5 });
  });

  it('findAll does not expose the correct answers publicly', async () => {
    svc.findAll.mockResolvedValue([question()]);
    const [res] = await controller.findAll({} as any);
    expect(res).not.toHaveProperty('correct');
  });

  it('findOne 404s for unknown questions and maps known ones', async () => {
    svc.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(question());
    await expect(controller.findOne('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(controller.findOne('x1')).resolves.toMatchObject({
      id: 'x1',
      correctPercentage: 0,
      answerDistribution: [],
    });
    svc.findOne.mockResolvedValue(question());
    const one: any = await controller.findOne('x1');
    expect(one).not.toHaveProperty('correct');
    expect(one).not.toHaveProperty('correctAnswer');
  });
});
