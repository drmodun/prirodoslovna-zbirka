import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import {
  PostResponse,
  ExponatResponseShort,
  OrganisationResponseShort,
  ExtendedUserResponse,
} from '@biosfera/types';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() login: LoginDto) {
    const accessToken = await this.authService.userPasswordLogin(
      login.email,
      login.password,
    );

    return {
      access_token: accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async whoami(@Req() { user }) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('detailed')
  async detailed(@Req() { user }) {
    const isAdmin = user?.role === 'super';
    const item = await this.usersService.findOne(user.id, false);

    const posts: PostResponse[] = item.Posts.map((post) => {
      return {
        authorId: item.id,
        authorName: item.username,
        id: post.id,
        thumbnail: post.thumbnailImage,
        ...(isAdmin && { isApproved: post.isApproved }),
        likeScore: post._count.Likes,
        title: post.title,
        exponatId: post.Exponat.id,
        organisationId: post.Exponat.organisationId,
        exponatName: post.Exponat.name,
        updatedAt: post.updatedAt,
        hasProfilePicture: item.hasProfileImage,
      };
    });

    const likedPosts: PostResponse[] = item.Likes.map((like) => {
      return {
        authorId: like.Post.author.id,
        authorName: like.Post.author.username,
        id: like.Post.id,
        thumbnail: like.Post.thumbnailImage,
        organisationId: like.Post.Exponat.organisationId,
        image: like.Post.image,
        likeScore: like.Post._count.Likes,
        title: like.Post.title,
        exponatId: like.Post.Exponat.id,
        ...(isAdmin && { isApproved: like.Post.isApproved }),
        exponatName: like.Post.Exponat.name,
        updatedAt: like.Post.updatedAt,
        hasProfilePicture: item.hasProfileImage,
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
          exponatKind: exponat.Exponat.ExponatKind,
        } as ExponatResponseShort;
      });

    const memberships: OrganisationResponseShort[] = item.OrganisationUser.map(
      (membership) => {
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
      },
    );

    const mapped: ExtendedUserResponse = {
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      followerCount: item._count.followers,
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      posts: posts,
      username: item.username,
      location: item.location,
      bio: item.bio,
      likedPosts: likedPosts,
      followingCount: item._count.following,
      hasProfileImage: item.hasProfileImage,
      likeCount: item.Posts.reduce((agg, curr) => agg + curr._count.Likes, 0),
      favouriteExponats,
      role: item.role,
      memberships,
    };

    return mapped;
  }
}
