import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SavedLiteratureService } from './literature.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ShortUserResponse, SavedLiteratureResponse } from '@biosfera/types';

@ApiTags('literature')
@Controller('literature')
export class LiteratureController {
  constructor(private readonly savedWorksService: SavedLiteratureService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async findAllForMe(@Req() req: any) {
    const works = await this.savedWorksService.findAllForUser(req.user.id);

    const mapped: SavedLiteratureResponse[] = works.map((connection) => {
      return {
        literatureId: connection.literatureId,
        userId: connection.userId,
        createdAt: connection.createdAt,
      } as SavedLiteratureResponse;
    });

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':literatureId')
  async create(@Req() req: any, @Param('literatureId') literatureId: string) {
    const connection = await this.savedWorksService.toggle(
      req.user.id,
      literatureId,
    );

    if (!connection)
      throw new BadRequestException('Toggling save status failed');
  }

  @Get('/user/:userId')
  async findAllForUser(@Param('userId') id: string) {
    const data = await this.savedWorksService.findAllForUser(id);

    const mapped = data.map((connection) => {
      return {
        literatureId: connection.literatureId,
        userId: connection.userId,
        createdAt: connection.createdAt,
      } as SavedLiteratureResponse;
    });

    return mapped;
  }

  @Get(':literatureId')
  async findAllForWork(@Param('literatureId') id: string) {
    const data = await this.savedWorksService.findAllForLiterature(id);

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
}
