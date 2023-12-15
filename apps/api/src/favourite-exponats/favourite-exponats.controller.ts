import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { FavouriteExponatsService } from './favourite-exponats.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('favourite-exponats')
@Controller('favourite-exponats')
export class FavouriteExponatsController {
  constructor(
    private readonly favouriteExponatsService: FavouriteExponatsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user')
  async findAllForUser(@Req() req: any) {
    return this.favouriteExponatsService.findAllForUser(req.user.id);
  }

  @Get(':exponatId')
  async findOne(@Param('exponatId') id: string) {
    return this.favouriteExponatsService.findAllForExponat(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':exponaid')
  async toggle(@Param('exponatId') id: string, @Req() req: any) {
    return this.favouriteExponatsService.toggle(req.user.id, id);
  }
}
