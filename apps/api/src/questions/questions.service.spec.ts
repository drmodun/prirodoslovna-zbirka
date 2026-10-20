import { QuestionsService } from './questions.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('QuestionsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: QuestionsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new QuestionsService(prisma as any);
  });

  describe('hasQuizEditPermission', () => {
    it('is false when the quiz does not exist', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);
      await expect(service.hasQuizEditPermission('z', 'u')).resolves.toBe(
        false,
      );
      expect(prisma.organisationUser.findFirst).not.toHaveBeenCalled();
    });

    it('is true for an ADMIN/OWNER member of the quiz organisation', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ organisationId: 'org' });
      prisma.user.findFirst.mockResolvedValue({ role: 'USER' });
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      await expect(service.hasQuizEditPermission('z', 'u')).resolves.toBe(true);
      expect(prisma.organisationUser.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'u',
          organisationId: 'org',
          OR: [{ role: 'ADMIN' }, { role: 'OWNER' }],
        },
      });
    });

    it('is true for super users', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ organisationId: 'org' });
      prisma.user.findFirst.mockResolvedValue({ role: 'SUPER' });
      await expect(service.hasQuizEditPermission('z', 'u')).resolves.toBe(true);
    });

    it('is false for non members / plain members', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ organisationId: 'org' });
      prisma.user.findFirst.mockResolvedValue({ role: 'USER' });
      prisma.organisationUser.findFirst.mockResolvedValue(null);
      await expect(service.hasQuizEditPermission('z', 'u')).resolves.toBe(
        false,
      );
    });
  });

  describe('hasEditPermission', () => {
    it('is false when the question does not exist', async () => {
      prisma.question.findUnique.mockResolvedValue(null);
      await expect(service.hasEditPermission('q', 'u')).resolves.toBe(false);
    });

    it('is false when the question belongs to another quiz', async () => {
      prisma.question.findUnique.mockResolvedValue({ quizId: 'other' });
      await expect(service.hasEditPermission('q', 'u', 'z')).resolves.toBe(
        false,
      );
      expect(prisma.quiz.findUnique).not.toHaveBeenCalled();
    });

    it("checks the rights on the question's quiz", async () => {
      prisma.question.findUnique.mockResolvedValue({ quizId: 'z' });
      prisma.quiz.findUnique.mockResolvedValue({ organisationId: 'org' });
      prisma.user.findFirst.mockResolvedValue({ role: 'USER' });
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      await expect(service.hasEditPermission('q', 'u', 'z')).resolves.toBe(
        true,
      );
      expect(prisma.quiz.findUnique.mock.calls[0][0].where).toEqual({
        id: 'z',
      });
    });
  });

  it('create connects the question to its quiz', async () => {
    await service.create({
      quizId: 'z',
      question: 'Q?',
      questionType: 'MULTIPLE_CHOICE',
      correct: ['a'],
      options: ['a', 'b'],
      points: 5,
      timeLimit: 10,
    } as any);
    const data = prisma.question.create.mock.calls[0][0].data;
    expect(data.quiz).toEqual({ connect: { id: 'z' } });
    expect(data.question).toBe('Q?');
    expect(data.points).toBe(5);
  });

  it('findAll filters by quiz only when quizId is given', async () => {
    await service.findAll({ quizId: 'z' } as any);
    await service.findAll({} as any);
    expect(prisma.question.findMany.mock.calls[0][0].where).toEqual({
      quizId: 'z',
    });
    expect(prisma.question.findMany.mock.calls[1][0].where).toEqual({});
  });

  it('findOne / update / remove target the id', async () => {
    await service.findOne('q');
    await service.update('q', { question: 'new' } as any);
    await service.remove('q');
    expect(prisma.question.findUnique).toHaveBeenCalledWith({
      where: { id: 'q' },
    });
    expect(prisma.question.update.mock.calls[0][0].where).toEqual({ id: 'q' });
    expect(prisma.question.update.mock.calls[0][0].data.question).toBe('new');
    expect(prisma.question.delete).toHaveBeenCalledWith({ where: { id: 'q' } });
  });
});
