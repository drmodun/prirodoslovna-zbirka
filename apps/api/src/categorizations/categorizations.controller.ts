import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategorizationsService } from './categorizations.service';
import { CreateCategorizationDto } from './dto/create-categorization.dto';
import { UpdateCategorizationDto } from './dto/update-categorization.dto';

@Controller('categorizations')
export class CategorizationsController {
  constructor(
    private readonly categorizationsService: CategorizationsService,
  ) {}

  @Post()
  create(@Body() createCategorizationDto: CreateCategorizationDto) {
    return this.categorizationsService.create(createCategorizationDto);
  }

  @Get()
  findAll() {
    return this.categorizationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categorizationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategorizationDto: UpdateCategorizationDto,
  ) {
    return this.categorizationsService.update(+id, updateCategorizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categorizationsService.remove(+id);
  }
}
