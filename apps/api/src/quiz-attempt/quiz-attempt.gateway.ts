import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { QuizAttemptService } from './quiz-attempt.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quiz-attempt.dto';

@WebSocketGateway()
export class QuizAttemptGateway {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  @SubscribeMessage('createQuizAttempt')
  create(@MessageBody() createQuizAttemptDto: CreateQuizAttemptDto) {
    return this.quizAttemptService.create(createQuizAttemptDto);
  }

  @SubscribeMessage('findAllQuizAttempt')
  findAll() {
    return this.quizAttemptService.findAll();
  }

  @SubscribeMessage('findOneQuizAttempt')
  findOne(@MessageBody() id: number) {
    return this.quizAttemptService.findOne(id);
  }

  @SubscribeMessage('updateQuizAttempt')
  update(@MessageBody() updateQuizAttemptDto: UpdateQuizAttemptDto) {
    return this.quizAttemptService.update(updateQuizAttemptDto.id, updateQuizAttemptDto);
  }

  @SubscribeMessage('removeQuizAttempt')
  remove(@MessageBody() id: number) {
    return this.quizAttemptService.remove(id);
  }
}
