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
  let members: { hasAdminRights: jest.Mock };
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
    };
    members = { hasAdminRights: jest.fn() };
    controller = new QuizzesController(svc as any, members as any);
  });

  describe('admin gated routes', () => {
    const calls: [string, () => Promise<unknown>, string][] = [
      ['create', () => controller.create({} as any, 'o1', req), 'create'],
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
      members.hasAdminRights.mockResolvedValue(false);
      await expect(call()).rejects.toBeInstanceOf(UnauthorizedException);
      expect(svc[method]).not.toHaveBeenCalled();
      expect(members.hasAdminRights).toHaveBeenCalledWith('me', 'o1');
    });

    it.each(calls)(
      '%s calls the service for admins',
      async (_n, call, method) => {
        members.hasAdminRights.mockResolvedValue(true);
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

  it.failing(
    'findAll reports the organisation name (not its image) as organisationName',
    async () => {
      svc.findAll.mockResolvedValue([quiz()]);
      const [res] = await controller.findAll({} as any);
      expect(res.organisationName).toBe('Org');
    },
  );

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
    members.hasAdminRights.mockResolvedValue(true);
    svc.getSingleWaitingForApproval.mockResolvedValue(quiz());
    const res = await controller.getQuizWaitingForApproval('o1', req, 'q1');
    expect(res.questions[0]).toMatchObject({ correct: ['a'], points: 5 });
  });

  it('getSingleWaitingForApproval 404s for unknown quizzes', async () => {
    members.hasAdminRights.mockResolvedValue(true);
    svc.getSingleWaitingForApproval.mockResolvedValue(null);
    await expect(
      controller.getQuizWaitingForApproval('o1', req, 'q1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // BUG: admin rights are checked against the organisation in the URL while
  // the quiz is created for `createQuizDto.organisationId`, so an admin of one
  // organisation can create quizzes for another by lying in the body.
  it.failing(
    'create pins the quiz to the organisation that was authorised',
    async () => {
      members.hasAdminRights.mockResolvedValue(true);
      const dto: any = { organisationId: 'someone-elses-org' };
      await controller.create(dto, 'o1', req);
      expect(svc.create.mock.calls[0][0].organisationId).toBe('o1');
    },
  );

  // BUG: the DELETE route is declared as ':orgnisationId/:id' (typo) while the
  // handler reads @Param('organisationId'), which is therefore always
  // undefined, and Prisma treats `organisationId: undefined` as "no filter".
  it.failing('delete route exposes the organisationId path parameter', () => {
    const path = Reflect.getMetadata(
      PATH_METADATA,
      QuizzesController.prototype.remove,
    );
    expect(path).toContain(':organisationId');
  });
});
