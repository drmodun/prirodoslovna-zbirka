import { Injectable } from '@nestjs/common';
import { CreateCategorizationDto } from './dto/create-categorization.dto';
import { UpdateCategorizationDto } from './dto/update-categorization.dto';

@Injectable()
export class CategorizationsService {
  create(createCategorizationDto: CreateCategorizationDto) {
    return 'This action adds a new categorization';
  }

  findAll() {
    return `This action returns all categorizations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categorization`;
  }

  update(id: number, updateCategorizationDto: UpdateCategorizationDto) {
    return `This action updates a #${id} categorization`;
  }

  remove(id: number) {
    return `This action removes a #${id} categorization`;
  }
}
