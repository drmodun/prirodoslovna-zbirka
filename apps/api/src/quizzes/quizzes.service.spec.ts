import { QuizzesService } from './quizzes.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('QuizzesService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: QuizzesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new QuizzesService(prisma as any);
  });

  it('create nests the questions', async () => {
    const dto: any = {
      title: 'Q',
      organisationId: 'o',
      questions: [{ question: '?' }],
    };
    prisma.quiz.create.mockResolvedValue({ id: 'q1' });
    await expect(service.create(dto)).resolves.toEqual({ id: 'q1' });
    expect(prisma.quiz.create.mock.calls[0][0].data).toMatchObject({
      title: 'Q',
      organisationId: 'o',
      questions: { create: [{ question: '?' }] },
    });
  });

  describe('findAll', () => {
    it('builds the where clause from every filter', async () => {
      await service.findAll({
        title: 'bears and wolves',
        difficulty: 'EASY',
        isTest: true,
        isRetakeable: true,
        isAnonymousAllowed: true,
        organisationId: 'o1',
      } as any);
      expect(prisma.quiz.findMany.mock.calls[0][0].where).toEqual({
        isApproved: true,
        title: { search: 'bears | and | wolves', mode: 'insensitive' },
        difficulty: 'EASY',
        isTest: true,
        isRetakeable: true,
        isAnonymousAllowed: true,
        organisationId: 'o1',
      });
    });

    it('reads the flags from query strings', async () => {
      await service.findAll({ isTest: 'false', isRetakeable: 'true' } as any);
      expect(prisma.quiz.findMany.mock.calls[0][0].where).toMatchObject({
        isTest: false,
        isRetakeable: true,
      });
    });

    it('only lists approved quizzes unless asked otherwise', async () => {
      await service.findAll({} as any);
      await service.findAll({} as any, false);
      expect(prisma.quiz.findMany.mock.calls[0][0].where).toEqual({
        isApproved: true,
      });
      expect(prisma.quiz.findMany.mock.calls[1][0].where).toEqual({});
    });

    it('pages 10 at a time by default', async () => {
      await service.findAll({} as any);
      const arg = prisma.quiz.findMany.mock.calls[0][0];
      expect(arg.skip).toBe(0);
      expect(arg.take).toBe(10);
    });

    it('orders by the requested attribute, defaulting to asc', async () => {
      await service.findAll({ attribute: 'title' } as any);
      await service.findAll({ attribute: 'title', direction: 'desc' } as any);
      expect(prisma.quiz.findMany.mock.calls[0][0].orderBy).toEqual({
        title: 'asc',
      });
      expect(prisma.quiz.findMany.mock.calls[1][0].orderBy).toEqual({
        title: 'desc',
      });
    });

    it('skips (page-1)*size rows', async () => {
      await service.findAll({ page: 3, size: 10 } as any);
      expect(prisma.quiz.findMany.mock.calls[0][0].skip).toBe(20);
    });
  });

  it('findOne loads questions and counts only finished attempts', async () => {
    await service.findOne('q');
    const arg = prisma.quiz.findUnique.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'q' });
    expect(arg.include.questions).toBe(true);
    expect(arg.include.attempts).toBeUndefined();
    expect(arg.include._count.select.attempts).toEqual({
      where: { submittedAt: { not: null } },
    });
  });

  it('averageScore averages the finished attempts, rounded to 2 places', async () => {
    prisma.attempt.aggregate.mockResolvedValue({ _avg: { score: 7 / 3 } });
    await expect(service.averageScore('q')).resolves.toBe(2.33);
    expect(prisma.attempt.aggregate).toHaveBeenCalledWith({
      where: { quizId: 'q', submittedAt: { not: null } },
      _avg: { score: true },
    });
  });

  it('averageScore is 0 without attempts', async () => {
    prisma.attempt.aggregate.mockResolvedValue({ _avg: { score: null } });
    await expect(service.averageScore('q')).resolves.toBe(0);
  });

  it('update replaces scalar fields and creates the given questions', async () => {
    await service.update('q', {
      title: 'n',
      questions: [{ question: '?' }],
    } as any);
    expect(prisma.quiz.update.mock.calls[0][0]).toMatchObject({
      where: { id: 'q' },
      data: { title: 'n', questions: { create: [{ question: '?' }] } },
    });
  });

  it.each([
    [false, true],
    [true, false],
  ])('toggleApprovalStatus flips %s to %s', async (before, after) => {
    prisma.quiz.findUnique.mockResolvedValue({ isApproved: before });
    await service.toggleApprovalStatus('q');
    expect(prisma.quiz.update).toHaveBeenCalledWith({
      where: { id: 'q' },
      data: { isApproved: after },
    });
  });

  it('remove deletes by id', async () => {
    await service.remove('q');
    expect(prisma.quiz.delete).toHaveBeenCalledWith({ where: { id: 'q' } });
  });

  it('getWaitingForApproval lists unapproved quizzes', async () => {
    await service.getWaitingForApproval();
    expect(prisma.quiz.findMany.mock.calls[0][0].where).toEqual({
      isApproved: false,
    });
  });

  it('getSingleWaitingForApproval includes the questions', async () => {
    await service.getSingleWaitingForApproval('q', 'o');
    const arg = prisma.quiz.findFirst.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'q', organisationId: 'o' });
    expect(arg.include.questions).toBe(true);
  });
});
