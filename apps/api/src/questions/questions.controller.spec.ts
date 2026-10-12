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
        await expect(call()).rejects.toBeInstanceOf(UnauthorizedException);
        expect(svc[method]).not.toHaveBeenCalled();
      },
    );

    it.each(calls)(
      '%s delegates for users with permission',
      async (_n, call, method) => {
        svc.hasEditPermission.mockResolvedValue(true);
        await call();
        expect(svc[method]).toHaveBeenCalled();
      },
    );

    it('create pins the question to the quiz in the URL', async () => {
      svc.hasEditPermission.mockResolvedValue(true);
      const dto: any = { quizId: 'spoofed' };
      await controller.create(dto, 'q1', req);
      expect(svc.create).toHaveBeenCalledWith(
        expect.objectContaining({ quizId: 'q1' }),
      );
    });
  });

  // BUG: `hasEditPermission` is documented/implemented to look a *question*
  // up by id, but the controller passes the *quiz* id from the URL. The
  // lookup can never find a question, so editing is always denied.
  it.failing(
    'checks edit permission against a question id, not the quiz id',
    async () => {
      svc.hasEditPermission.mockResolvedValue(true);
      await controller.update('x1', {} as any, req, 'q1');
      expect(svc.hasEditPermission).toHaveBeenCalledWith('x1', 'me');
    },
  );

  it('findAll maps questions', async () => {
    svc.findAll.mockResolvedValue([question()]);
    const [res] = await controller.findAll({} as any);
    expect(res).toMatchObject({ id: 'x1', points: 5 });
  });

  // DESIGN/SECURITY: the public listing includes the `correct` answers, so
  // quiz answers can be read by anyone before taking a quiz.
  it.failing(
    'findAll does not expose the correct answers publicly',
    async () => {
      svc.findAll.mockResolvedValue([question()]);
      const [res] = await controller.findAll({} as any);
      expect(res).not.toHaveProperty('correct');
    },
  );

  it('findOne 404s for unknown questions and maps known ones', async () => {
    svc.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(question());
    await expect(controller.findOne('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(controller.findOne('x1')).resolves.toMatchObject({
      id: 'x1',
      correctAnswer: ['a'],
      correctPercentage: 0,
      answerDistribution: [],
    });
  });
});
