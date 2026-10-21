import { isAnswerCorrect } from './scoring';

const q = (questionType: any, correct: string[]) => ({ questionType, correct });

describe('isAnswerCorrect', () => {
  describe('multiple choice', () => {
    const single = q('MULTIPLE_CHOICE', ['crvena']);
    const multi = q('MULTIPLE_CHOICE', ['crvena', 'smeđa']);

    it.each([
      [single, ['crvena'], true],
      [single, ['plava'], false],
      [single, ['crvena', 'plava'], false],
      [single, ['Crvena'], false], // options are picked, not typed
      [multi, ['smeđa', 'crvena'], true],
      [multi, ['crvena'], false],
      [multi, ['crvena', 'crvena'], false],
      [single, [], false],
    ])('%j with %j → %s', (question, answer, expected) => {
      expect(isAnswerCorrect(question, answer)).toBe(expected);
    });
  });

  describe('true / false', () => {
    const t = q('TRUE_FALSE', ['true']);
    it.each([
      [['true'], true],
      [['TRUE '], true],
      [['false'], false],
      [['true', 'false'], false],
      [[], false],
    ])('%j → %s', (answer, expected) => {
      expect(isAnswerCorrect(t, answer)).toBe(expected);
    });
  });

  describe('fill in the blank', () => {
    const f = q('FILL_IN_THE_BLANK', ['Vulpes vulpes', 'lisica']);
    it.each([
      [['vulpes vulpes'], true],
      [['  LISICA '], true],
      [['vuk'], false],
      [[''], false],
      [['lisica', 'vuk'], false],
    ])('%j → %s', (answer, expected) => {
      expect(isAnswerCorrect(f, answer)).toBe(expected);
    });
  });

  it('a question without correct answers is never answered correctly', () => {
    expect(isAnswerCorrect(q('FILL_IN_THE_BLANK', []), ['x'])).toBe(false);
  });
});
