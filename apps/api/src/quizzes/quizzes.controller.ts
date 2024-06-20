import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, QuizQuery, UpdateQuizDto } from './quizzes.dto';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { AuthController } from 'src/auth/auth.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExponatsService } from 'src/exponats/exponats.service';
import { MembersService } from 'src/members/members.service';
@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly membersService: MembersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organisationId')
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @Param('organisationId') organisation: string,
    @Req() req: any,
  ) {
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation,
    );


    if (!isValid) throw new UnauthorizedException();
    return await this.quizzesService.create(createQuizDto);
  }

  @Get()
  async findAll(@Query() query: QuizQuery) {
    return await this.quizzesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: ) {
    return this.quizzesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':organisationId/:id')
  async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto, @Req() req: any, @Param('organisationId') organisation: string){
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation      
    );


    if (!isValid) throw new UnauthorizedException();
   
    return await this.quizzesService.update(id, updateQuizDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':orgnisationId/:id')
  async remove(@Param('id') id: string, @Req() req: any, @Param('organisationId') organisation: string) {
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation,
    );

    if (!isValid) throw new UnauthorizedException();
    return await this.quizzesService.remove(id);
  }
}
