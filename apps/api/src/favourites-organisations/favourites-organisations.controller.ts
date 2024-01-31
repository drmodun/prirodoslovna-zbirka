import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { FavouriteOrganisationsService } from './favourites-organisations.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganisationResponseShort, ShortUserResponse } from '@biosfera/types';

@ApiTags('favourite-orgranisations')
@Controller('favourite-orgranisations')
export class FavouriteOrgranisationsController {
  constructor(
    private readonly favouriteOrgranisationsService: FavouriteOrganisationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user')
  async findAllForUser(@Req() req: any) {
    const orgranisations =
      await this.favouriteOrgranisationsService.findAllForUser(req.user.id);

    const mapped = orgranisations.map((connection) => {
      return {
        exponatCount: connection.organisation._count.Exponats,
        followerCount: connection.organisation._count.UserOrganisationFollowers,
        location: connection.organisation.location,
        mainImage: connection.organisation.mainImage,
        name: connection.organisation.name,
        updatedAt: connection.organisation.updatedAt,
        points: connection.organisation.Exponats.reduce(
          (acc, curr) => acc + curr._count.FavouriteExponats,
          0,
        ),
        memberCount: connection.organisation._count.OrganisationUsers,
        id: connection.organisationId,
        websiteUrl: connection.organisation.websiteUrl,
      } as OrganisationResponseShort;
    });

    return mapped;
  }

  @Get(':orgranisationId')
  async findAllForOrgranisation(@Param('orgranisationId') id: string) {
    const users =
      await this.favouriteOrgranisationsService.findAllForOrganisation(id);

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
  @Patch(':orgranisationId')
  async toggle(@Param('orgranisationId') id: string, @Req() req: any) {
    return (
      (await this.favouriteOrgranisationsService.toggle(req.user.id, id)) !=
      null
    );
  }
}
