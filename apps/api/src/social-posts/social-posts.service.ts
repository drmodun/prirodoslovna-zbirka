import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSocialPostDto,
  SocialPostQuery,
  UpdateSocialPostDto,
} from './dto/socialPost.dto';
import { Role } from '@prisma/client';
import {
  PaginationRequest,
  SortingRequest,
  socialPostSortQueryBuilder,
} from '@biosfera/types';

@Injectable()
export class SocialPostsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkForValidity(userId: string, orgranisationId: string) {
    const connection = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId: orgranisationId,
      },
    });

    if (!connection) {
      const checkIsSuper = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (checkIsSuper.role !== Role.SUPER) throw new UnauthorizedException();

      return true;
    }

    return connection?.role === Role.ADMIN;
  }

  async create(
    createSocialPostDto: CreateSocialPostDto,
    organisationId: string,
    userId: string,
  ) {
    const check = await this.checkForValidity(userId, organisationId);

    if (!check) throw new UnauthorizedException();

    return await this.prisma.socialPost.create({
      data: {
        text: createSocialPostDto.text,
        title: createSocialPostDto.title,
        images: [],
        isApproved: true,
        organisationId: organisationId,
        authorshipInfoId: createSocialPostDto.authorshipInfoId,
      },
      include: {
        organisation: true,
      },
    });
  }

  async findAll(
    filter: SocialPostQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
    approval?: boolean,
  ) {
    const sort = socialPostSortQueryBuilder(sorting);
    const posts = this.prisma.socialPost.findMany({
      where: {
        ...(filter?.title && { title: filter.title }),
        ...(filter?.authorId && { title: filter.authorId }),
        ...(approval && { isApproved: approval }),
      },

      orderBy: sort,
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
      include: {
        organisation: true,
        AuthorshipInfo: true,
      },
    });

    return posts;
  }

  async findOne(id: string, approval?: boolean) {
    const post = await this.prisma.socialPost.findFirst({
      where: {
        id,
        ...(approval && { isApproved: approval }),
      },
      include: {
        organisation: true,
        AuthorshipInfo: true,
      },
    });

    return post;
  }

  async update(
    updateSocialPostDto: UpdateSocialPostDto,
    id: string,
    userId: string,
    organisationId: string,
  ) {
    const check = await this.checkForValidity(userId, organisationId);

    if (!check) throw new UnauthorizedException();

    return await this.prisma.socialPost.update({
      where: {
        id,
      },
      data: updateSocialPostDto,
    });
  }

  async remove(id: string, organisationId: string, userId: string) {
    const check = await this.checkForValidity(userId, organisationId);

    if (!check) throw new UnauthorizedException();

    return await this.prisma.socialPost.deleteMany({
      where: {
        id,
      },
    });
  }

  async changeApprovalStatus(
    id: string,
    userId: string,
    organisationId: string,
  ) {
    const check = await this.checkForValidity(userId, organisationId);

    if (!check) throw new UnauthorizedException();

    const post = await this.prisma.socialPost.findFirst({
      where: {
        id,
      },
    });

    if (!post) return false;

    return await this.prisma.socialPost.update({
      where: {
        id,
      },
      data: {
        isApproved: !post.isApproved,
      },
    });
  }

  async checkForExistingValidity(userId: string, socialPostId: string) {
    const post = await this.prisma.socialPost.findFirst({
      where: {
        id: socialPostId,
      },
    });

    if (!post) return false;

    const check = await this.checkForValidity(userId, post.organisationId);

    return check;
  }
}
