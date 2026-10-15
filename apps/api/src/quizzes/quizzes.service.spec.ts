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
        title: { search: 'bears | and | wolves', mode: 'insensitive' },
        difficulty: 'EASY',
        category: true,
        isRetakeable: true,
        isAnonymousAllowed: true,
        organisationId: 'o1',
      });
    });

    it('has an empty where clause without filters', async () => {
      await service.findAll({} as any);
      expect(prisma.quiz.findMany.mock.calls[0][0].where).toEqual({});
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

  it('findOne loads questions, counts and attempts', async () => {
    await service.findOne('q');
    const arg = prisma.quiz.findUnique.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'q' });
    expect(arg.include.questions).toBe(true);
    expect(arg.include.attempts.include.Answer).toBe(true);
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
    await service.getSingleWaitingForApproval('q');
    const arg = prisma.quiz.findUnique.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'q' });
    expect(arg.include.questions).toBe(true);
  });
});
