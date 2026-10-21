import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { QuizzesController } from './quizzes.controller';

const date = new Date('2024-07-07T00:00:00Z');
const quiz = (over: any = {}) => ({
  id: 'q1',
  title: 'Quiz',
  description: 'd',
  difficulty: 'EASY',
  isTest: false,
  isRetakeable: true,
  isAnonymousAllowed: false,
  coverImage: 'c',
  organisationId: 'o1',
  timeLimitTotal: 60,
  updatedAt: date,
  organisation: { name: 'Org', mainImage: 'orgimg' },
  _count: { attempts: 3, questions: 2 },
  questions: [
    {
      id: 'x1',
      question: '?',
      questionType: 'SINGLE',
      options: ['a', 'b'],
      correct: ['a'],
      image: 'i',
      points: 5,
      timeLimit: 10,
    },
  ],
  ...over,
});

describe('QuizzesController', () => {
  let svc: Record<string, jest.Mock>;
  let members: { hasModerationRights: jest.Mock; hasAdminRights: jest.Mock };
  let controller: QuizzesController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      toggleApprovalStatus: jest.fn(),
      getWaitingForApproval: jest.fn(),
      getSingleWaitingForApproval: jest.fn(),
      belongsTo: jest.fn(),
      averageScore: jest.fn().mockResolvedValue(0),
    };
    members = { hasModerationRights: jest.fn(), hasAdminRights: jest.fn() };
    controller = new QuizzesController(svc as any, members as any);
  });

  describe('admin gated routes', () => {
    const calls: [string, () => Promise<unknown>, string][] = [
      ['update', () => controller.update('q1', {} as any, req, 'o1'), 'update'],
      ['remove', () => controller.remove('q1', req, 'o1'), 'remove'],
      [
        'toggleApproval',
        () => controller.toggleApproval('q1', req, 'o1'),
        'toggleApprovalStatus',
      ],
      [
        'getQuizzesWaitingForApproval',
        () => controller.getQuizzesWaitingForApproval('o1', req),
        'getWaitingForApproval',
      ],
      [
        'getQuizWaitingForApproval',
        () => controller.getQuizWaitingForApproval('o1', req, 'q1'),
        'getSingleWaitingForApproval',
      ],
    ];

    it.each(calls)('%s rejects non admins', async (_n, call, method) => {
      members.hasModerationRights.mockResolvedValue(false);
      await expect(call()).rejects.toBeInstanceOf(UnauthorizedException);
      expect(svc[method]).not.toHaveBeenCalled();
      expect(members.hasModerationRights).toHaveBeenCalledWith('me', 'o1');
    });

    it.each(calls)(
      '%s calls the service for admins',
      async (_n, call, method) => {
        members.hasModerationRights.mockResolvedValue(true);
        svc.belongsTo.mockResolvedValue(true);
        svc[method].mockResolvedValue(quiz());
        svc.getWaitingForApproval.mockResolvedValue([quiz()]);
        await call();
        expect(svc[method]).toHaveBeenCalled();
      },
    );
  });

  it('findAll maps quizzes with counts', async () => {
    svc.findAll.mockResolvedValue([quiz()]);
    const [res] = await controller.findAll({} as any);
    expect(res).toMatchObject({
      id: 'q1',
      attemptsAmount: 3,
      questionAmount: 2,
      organisationMainImage: 'orgimg',
    });
  });

  it('findAll reports the organisation name (not its image) as organisationName', async () => {
    svc.findAll.mockResolvedValue([quiz()]);
    const [res] = await controller.findAll({} as any);
    expect(res.organisationName).toBe('Org');
  });

  describe('findOne', () => {
    it('404s for unknown quizzes', async () => {
      svc.findOne.mockResolvedValue(null);
      await expect(controller.findOne('q')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('never leaks the correct answers or points of questions', async () => {
      svc.findOne.mockResolvedValue(quiz());
      const res = await controller.findOne('q1');
      expect(res.questions[0]).toEqual({
        id: 'x1',
        questionType: 'SINGLE',
        timeLimit: 10,
        options: ['a', 'b'],
        question: '?',
        image: 'i',
      });
      expect(res).toMatchObject({ organisationName: 'Org', attemptsAmount: 3 });
    });
  });

  it('the admin view of a pending quiz does include the correct answers', async () => {
    members.hasModerationRights.mockResolvedValue(true);
    svc.getSingleWaitingForApproval.mockResolvedValue(quiz());
    const res = await controller.getQuizWaitingForApproval('o1', req, 'q1');
    expect(res.questions[0]).toMatchObject({ correct: ['a'], points: 5 });
  });

  it('getSingleWaitingForApproval 404s for unknown quizzes', async () => {
    members.hasModerationRights.mockResolvedValue(true);
    svc.getSingleWaitingForApproval.mockResolvedValue(null);
    await expect(
      controller.getQuizWaitingForApproval('o1', req, 'q1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  describe('create', () => {
    it('needs organisation admin rights; moderation rights are not enough', async () => {
      members.hasAdminRights.mockResolvedValue(false);
      members.hasModerationRights.mockResolvedValue(true);
      await expect(
        controller.create({} as any, 'o1', req),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(members.hasAdminRights).toHaveBeenCalledWith('me', 'o1');
      expect(svc.create).not.toHaveBeenCalled();
    });

    it('calls the service for organisation admins', async () => {
      members.hasAdminRights.mockResolvedValue(true);
      await controller.create({} as any, 'o1', req);
      expect(svc.create).toHaveBeenCalled();
    });
  });

  it('create pins the quiz to the organisation that was authorised', async () => {
    members.hasAdminRights.mockResolvedValue(true);
    const dto: any = { organisationId: 'someone-elses-org' };
    await controller.create(dto, 'o1', req);
    expect(svc.create.mock.calls[0][1]).toBe('o1');
  });

  it('delete route exposes the organisationId path parameter', () => {
    const path = Reflect.getMetadata(
      PATH_METADATA,
      QuizzesController.prototype.remove,
    );
    expect(path).toContain(':organisationId');
  });

  it.each([
    ['update', () => controller.update('q1', {} as any, req, 'o1')],
    ['remove', () => controller.remove('q1', req, 'o1')],
    ['toggleApproval', () => controller.toggleApproval('q1', req, 'o1')],
  ] as const)(
    '%s 404s for quizzes of another organisation',
    async (_n, call) => {
      members.hasModerationRights.mockResolvedValue(true);
      svc.belongsTo.mockResolvedValue(false);
      await expect(call()).rejects.toBeInstanceOf(NotFoundException);
    },
  );
});
