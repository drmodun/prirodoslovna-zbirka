import { QuestionsService } from './questions.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('QuestionsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: QuestionsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new QuestionsService(prisma as any);
  });

  describe('hasEditPermission', () => {
    it('is false when the question does not exist', async () => {
      prisma.question.findUnique.mockResolvedValue(null);
      await expect(service.hasEditPermission('q', 'u')).resolves.toBe(false);
      expect(prisma.organisationUser.findFirst).not.toHaveBeenCalled();
    });

    it('is true for an ADMIN/OWNER member of the quiz organisation', async () => {
      prisma.question.findUnique.mockResolvedValue({
        quiz: { organisationId: 'org' },
      });
      prisma.organisationUser.findFirst.mockResolvedValue({ id: 'm' });
      await expect(service.hasEditPermission('q', 'u')).resolves.toBe(true);
      expect(prisma.organisationUser.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'u',
          organisationId: 'org',
          OR: [{ role: 'ADMIN' }, { role: 'OWNER' }],
        },
      });
    });

    it('is false for non members / plain members', async () => {
      prisma.question.findUnique.mockResolvedValue({
        quiz: { organisationId: 'org' },
      });
      prisma.organisationUser.findFirst.mockResolvedValue(null);
      await expect(service.hasEditPermission('q', 'u')).resolves.toBe(false);
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
