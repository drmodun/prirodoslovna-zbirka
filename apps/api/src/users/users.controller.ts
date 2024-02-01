import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
  NotFoundException,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto, UpdateUserDto } from './dto/users.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationParams } from 'src/config/pagination';
import {
  ExponatResponseShort,
  PaginationRequest,
  SortingEnum,
  SortingRequest,
} from '@biosfera/types';
import { UserQuery } from '@biosfera/types';
import { SortingParams } from '../config/sorting';
import { ExtendedUserResponse, ShortUserResponse } from '@biosfera/types';
import { PostResponse } from '@biosfera/types';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth-guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.usersService.create(registerUserDto);

    return user.id;
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'sorting', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'organisation', required: false })
  async findAll(
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([
      SortingEnum.NAME,
      SortingEnum.COUNTY,
      SortingEnum.POST_AMOUNT,
      SortingEnum.POINTS,
      SortingEnum.FOLLOWERS,
      SortingEnum.FOLLOWERS_ORGANISATION,
      SortingEnum.FOLLOWING,
    ])
    sorting?: SortingRequest,
    @Query() filter?: UserQuery,
  ) {
    const users = await this.usersService.findAll(
      filter,
      sorting,
      paginationParam,
    );

    const mapped: ShortUserResponse[] = users.map((user) => {
      return {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location,
        followerCount: user._count.followers,
        postCount: user._count.Posts,
        id: user.id,
      };
    });

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('requests')
  async getMyRequests(@Req() req: any) {
    const requests = await this.usersService.getJoinRequests(req.user.id);

    const mapped: OrganisationResponseShort[] = requests.map((request) => {
      return {
        id: request.organisation.id,
        name: request.organisation.name,
        exponatCount: request.organisation._count.Exponats,
        followerCount: request.organisation._count.UserOrganisationFollowers,
        location: request.organisation.location,
        mainImage: request.organisation.mainImage,
        memberCount: request.organisation._count.OrganisationUsers,
        points: request.organisation.Exponats.reduce(
          (acc, curr) => acc + curr._count.FavouriteExponats,
          0,
        ),
        updatedAt: request.organisation.updatedAt,
        websiteUrl: request.organisation.websiteUrl,
        role: request.role,
      } as OrganisationResponseShort;
    });

    return mapped;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const isAdmin = req.user?.role === 'super';
    try {
      const item = await this.usersService.findOne(id, !isAdmin);

      const posts: PostResponse[] = item.Posts.map((post) => {
        return {
          updatedAt: post.updatedAt,
          authorId: item.id,
          authorName: item.firstName + ' ' + item.lastName,
          id: post.id,
          images: post.images,
          ...(isAdmin && { isApproved: post.isApproved }),
          likeScore: post._count.Likes,
          hasProfilePicture: item.hasProfileImage,
          title: post.title,
          exponatId: post.Exponat.id,
          exponatName: post.Exponat.name,
        };
      });

      const likedPosts: PostResponse[] = item.Likes.map((like) => {
        return {
          authorId: like.Post.author.id,
          authorName:
            like.Post.author.firstName + ' ' + like.Post.author.lastName,
          id: like.Post.id,
          images: like.Post.images,
          likeScore: like.Post._count.Likes,
          updatedAt: like.Post.updatedAt,
          hasProfilePicture: like.Post.author.hasProfileImage,
          title: like.Post.title,
          exponatId: like.Post.Exponat.id,
          ...(isAdmin && { isApproved: like.Post.isApproved }),
          exponatName: like.Post.Exponat.name,
        };
      });

      const favouriteExponats: ExponatResponseShort[] =
        item.FavouriteExponats.map((exponat) => {
          return {
            id: exponat.Exponat.id,
            name: exponat.Exponat.name,
            mainImage: exponat.Exponat.mainImage,
            updatedAt: exponat.Exponat.updatedAt,
            favouriteCount: exponat.Exponat._count.FavouriteExponats,
            postCount: exponat.Exponat._count.Posts,
            alternateName: exponat.Exponat.alternateName,
            description: exponat.Exponat.description,
            organizationId: exponat.Exponat.organisationId,
            organizationName: exponat.Exponat.Organisation.name,
            isFavorite: true,
          } as ExponatResponseShort;
        });

      const memberships: OrganisationResponseShort[] =
        item.OrganisationUser.map((membership) => {
          return {
            id: membership.organisation.id,
            name: membership.organisation.name,
            exponatCount: membership.organisation._count.Exponats,
            followerCount:
              membership.organisation._count.UserOrganisationFollowers,
            location: membership.organisation.location,
            mainImage: membership.organisation.mainImage,
            memberCount: membership.organisation._count.OrganisationUsers,
            points: membership.organisation.Exponats.reduce(
              (acc, curr) => acc + curr._count.FavouriteExponats,
              0,
            ),
            updatedAt: membership.organisation.updatedAt,
            websiteUrl: membership.organisation.websiteUrl,
            role: membership.role,
          } as OrganisationResponseShort;
        });

      const mapped: ExtendedUserResponse = {
        email: item.email,
        firstName: item.firstName,
        lastName: item.lastName,
        followerCount: item._count.followers,
        id: item.id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        posts: posts,
        location: item.location,
        bio: item.bio,
        likedPosts: likedPosts,
        followingCount: item._count.following,
        hasProfileImage: item.hasProfileImage,
        favouriteExponats: favouriteExponats,
        likeCount: item.Posts.reduce((agg, curr) => agg + curr._count.Likes, 0),
        favouriteExponats,
        memberships,
      };

      return mapped;
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    return (
      (await this.usersService.update(req.user.id, updateUserDto)) !== null
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete()
  async remove(@Req() req: any) {
    return (await this.usersService.remove(req.user.id)) !== null;
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async adminUpdate(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    if (req.user.role !== 'super') {
      throw new UnauthorizedException();
    }

    return (await this.usersService.update(id, updateUserDto)) !== null;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async adminDelete(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'super') {
      throw new UnauthorizedException();
    }

    return (await this.usersService.remove(id)) !== null;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/requests')
  async getRequests(@Param('id') id: string, @Req() req?: any) {
    if (req.user.role !== 'super') {
      throw new UnauthorizedException();
    }

    const requests = await this.usersService.getJoinRequests(id);

    const mapped: OrganisationResponseShort[] = requests.map((request) => {
      return {
        id: request.organisation.id,
        name: request.organisation.name,
        exponatCount: request.organisation._count.Exponats,
        followerCount: request.organisation._count.UserOrganisationFollowers,
        location: request.organisation.location,
        mainImage: request.organisation.mainImage,
        memberCount: request.organisation._count.OrganisationUsers,
        points: request.organisation.Exponats.reduce(
          (acc, curr) => acc + curr._count.FavouriteExponats,
          0,
        ),
        updatedAt: request.organisation.updatedAt,
        websiteUrl: request.organisation.websiteUrl,
        role: request.role,
      } as OrganisationResponseShort;
    });

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/pfp')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async addLogo(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const addedSponsorLogo = await this.usersService.uploadProfileImage(
      req.user.id,
      file,
    );

    return addedSponsorLogo;
  }

  @Post(':id/verify')
  async verifyUser(@Param('id') id: string) {
    const verifiedUser = await this.usersService.sendVefificationEmail(id);

    return verifiedUser;
  }
}

//TODO: add approval double route for other connected apis and properties such as likes
//TODO: make a seperate mappers folder later
