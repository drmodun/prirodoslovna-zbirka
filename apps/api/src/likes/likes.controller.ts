import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':postId')
  async toggleLike(@Req() req: any, @Param('postId') postId: string) {
    await this.likesService.toggleLike(req.user?.id, postId);
  }
}
