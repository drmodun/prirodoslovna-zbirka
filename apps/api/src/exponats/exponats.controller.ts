import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExponatsService } from './exponats.service';
import { CreateExponatDto } from './dto/exponats.dto';
import { UpdateExponatDto } from './dto/update-exponat.dto';

@Controller('exponats')
export class ExponatsController {
  constructor(private readonly exponatsService: ExponatsService) {}

  @Post()
  create(@Body() createExponatDto: CreateExponatDto) {
    return this.exponatsService.create(createExponatDto);
  }

  @Get()
  findAll() {
    return this.exponatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exponatsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExponatDto: UpdateExponatDto) {
    return this.exponatsService.update(+id, updateExponatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exponatsService.remove(+id);
  }
}
