import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { FavouriteExponatsService } from './favourite-exponats.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExponatResponseShort, ShortUserResponse } from '@biosfera/types';

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
    const exponats = await this.favouriteExponatsService.findAllForUser(
      req.user.id,
    );

    const mapped = exponats.map((connection) => {
      return {
        alternateName: connection.Exponat.alternateName,
        name: connection.Exponat.name,
        id: connection.Exponat.id,
        description: connection.Exponat.description,
        favouriteCount: connection.Exponat._count.FavouriteExponats,
        organizationId: connection.Exponat.organisationId,
        mainImage: connection.Exponat.mainImage,
        postCount: connection.Exponat._count.Posts,
        updatedAt: connection.Exponat.updatedAt,
        organizationName: connection.Exponat.Organisation.name,
      } as ExponatResponseShort;
    });

    return mapped;
  }

  @Get(':exponatId')
  async findAllForExponat(@Param('exponatId') id: string) {
    const users = await this.favouriteExponatsService.findAllForExponat(id);

    const mapped = users.map((connection) => {
      return {
        email: connection.user.email,
        id: connection.userId,
        lastName: connection.user.lastName,
        firstName: connection.user.firstName,
        postCount: connection.user._count.Posts,
        followerCount: connection.user._count.followers,
      } as ShortUserResponse;
    });

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':exponatId')
  async toggle(@Param('exponatId') id: string, @Req() req: any) {
    return (
      (await this.favouriteExponatsService.toggle(req.user.id, id)) != null
    );
  }
}
