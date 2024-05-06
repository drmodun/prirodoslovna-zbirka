import { Module } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptGateway } from './quiz-attempt.gateway';

@Module({
  providers: [QuizAttemptGateway, QuizAttemptService]
})
export class QuizAttemptModule {}
