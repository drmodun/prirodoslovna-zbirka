import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SavedWorksService } from './saved-works.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ShortUserResponse, WorkResponseShort } from '@biosfera/types';

@Controller('saved-works')
export class SavedWorksController {
  constructor(private readonly savedWorksService: SavedWorksService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user')
  async findAllForUser(@Req() req: any) {
    const works = await this.savedWorksService.findAllForUser(req.user.id);

    const mapped: WorkResponseShort[] = works.map((connection) => {
      return {
        authorId: connection.work.authorId,
        auhtorName: connection.work.author.username,
        organisationName: connection.work.organisation.name,
        organisationId: connection.work.organisationId,
        description: connection.work.description,
        id: connection.work.id,
        poster: connection.work.poster,
        updatedAt: connection.work.updatedAt,
        title: connection.work.title,
        amountOfSaves: connection.work._count.SavedWorks,
      } as WorkResponseShort;
    });

    return mapped;
  }

  @Get(':workId')
  async findAllForWork(@Param('workId') id: string) {
    const data = await this.savedWorksService.findAllForwork(id);

    const mapped = data.map((connection) => {
      return {
        email: connection.user.email,
        id: connection.userId,
        lastName: connection.user.lastName,
        firstName: connection.user.firstName,
        postCount: connection.user._count.Posts,
        followerCount: connection.user._count.followers,
        username: connection.user.username,
      } as ShortUserResponse;
    });

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':workId')
  async create(@Req() req: any, @Param('workId') workId: string) {
    const connection = await this.savedWorksService.toggle(req.user.id, workId);

    if (!connection)
      throw new BadRequestException('Toggling save status failed');
  }
}
