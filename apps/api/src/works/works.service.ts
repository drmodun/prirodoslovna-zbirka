import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkDto, UpdateWorkDto, WorkQuery } from './dto/works.entity';
import {
  PaginationRequest,
  SortingRequest,
  worksSortQueryBuilder,
} from '@biosfera/types';
import { MemberRole } from '@prisma/client';

@Injectable()
export class WorksService {
  constructor(private readonly prisma: PrismaService) {}

  async checkMembership(userId: string, organisationId: string) {
    const membership = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId,
        NOT: {
          role: MemberRole.REQUESTED,
        },
      },
    });

    return membership;
  }

  async create(createWorkDto: CreateWorkDto) {
    const data = createWorkDto;
    const work = await this.prisma.work.create({
      data: {
        ...data,
      },
      include: {
        author: true,
      },
    });
    return work;
  }

  async findAll(
    filter: WorkQuery,
    sorting?: SortingRequest,
    pagination?: PaginationRequest,
    approval: boolean = true,
  ) {
    const sort = sorting && worksSortQueryBuilder(sorting);
    const works = await this.prisma.work.findMany({
      where: {
        ...(filter?.title && { title: filter.title }),
        ...(filter?.authorId && { authorId: filter.authorId }),
        ...(filter?.approvedBy && { approvedBy: filter.approvedBy }),
        ...(filter?.organisationId && {
          organisationId: filter.organisationId,
        }),
        ...(filter?.tags && { tags: { hasSome: filter.tags } }), //TODO: test
        ...(approval && { isApproved: approval }),
        ...(filter?.type && { type: filter.type }),
      },
      include: {
        organisation: true,
        author: true,
        _count: {
          select: {
            SavedWorks: true,
          },
        },
      },
      orderBy: sort,
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
    });

    return works;
  }

  async findOne(id: string, approval: boolean = true) {
    const work = await this.prisma.work.findFirst({
      where: {
        id,
        ...(approval && { isApproved: approval }),
      },
      include: {
        approver: true,
        author: true,
        organisation: true,

        _count: {
          select: {
            SavedWorks: true,
          },
        },
      },
    });

    return work;
  }

  async update(id: string, updateWorkDto: UpdateWorkDto) {
    const data = updateWorkDto;
    const work = await this.prisma.work.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return work;
  }

  async checkIsAdmin(userId: string, organisationId: string) {
    const membership = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId,
        role: MemberRole.ADMIN,
      },
    });

    return membership != null;
  }

  async checkRights(authorId: string, workId: string) {
    const work = await this.prisma.work.findFirst({
      where: {
        id: workId,
      },
    });

    if (work.authorId === authorId) return true;

    const checkSuper = this.prisma.user.findFirst({
      where: {
        id: authorId,
      },
    });

    const checkAdmin = this.prisma.organisationUser.findFirst({
      where: {
        userId: authorId,
        organisationId: work.organisationId,
        role: 'ADMIN',
      },
    });

    return checkSuper || checkAdmin;
  }

  async remove(id: string) {
    const work = await this.prisma.work.delete({
      where: { id },
    });

    return work;
  }

  async toggleApproval(id: string, approverId: string) {
    const work = await this.prisma.work.findFirst({
      where: {
        id,
      },
    });

    return work.isApproved ? this.disapprove(id) : this.approve(id, approverId);
  }

  async approve(id: string, approverId: string) {
    const work = await this.prisma.work.update({
      where: { id },
      data: {
        isApproved: true,
        approvedBy: approverId,
      },
    });

    return work;
  }

  async disapprove(id: string) {
    const work = await this.prisma.work.update({
      where: { id },
      data: {
        isApproved: false,
        approvedBy: null,
      },
    });

    return work;
  }
}
