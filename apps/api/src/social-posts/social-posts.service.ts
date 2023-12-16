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

    if (!connection) return false;

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
        authorId: organisationId,
        isApproved: true, //TODO: Discuess default approval status for social posts
      },
    });
  }

  async findAll(
    filter: SocialPostQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
  ) {
    const sort = socialPostSortQueryBuilder(sorting);
    const posts = this.prisma.socialPost.findMany({
      where: {
        ...(filter?.title && { title: filter.title }),
        ...(filter?.authorId && { title: filter.authorId }),
      },

      orderBy: sort,
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
    });

    return posts;
  }

  async update(
    UpdateSocialPostDto: UpdateSocialPostDto,
    organisationId: string,
    userId: string,
    id: string,
  ) {
    const check = await this.checkForValidity(userId, organisationId);

    if (!check) throw new UnauthorizedException();

    return await this.prisma.socialPost.update({
      where: {
        id,
      },
      data: UpdateSocialPostDto,
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
}
