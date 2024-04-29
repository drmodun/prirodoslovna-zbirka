import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlobService } from 'src/blob/blob.service';
import { CreateWorkDto, UpdateWorkDto, WorkQuery } from './dto/works.entity';
import {
  PaginationRequest,
  SortingRequest,
  worksSortQueryBuilder,
} from '@biosfera/types';

@Injectable()
export class WorksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blobService: BlobService,
  ) {}

  async create(createWorkDto: CreateWorkDto) {
    const data = createWorkDto;
    const work = await this.prisma.work.create({
      data: {
        ...data,
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
        ...(approval && { isApproved: approval }),
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

  async remove(id: string) {
    const work = await this.prisma.work.delete({
      where: { id },
    });

    return work;
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

  async disApprove(id: string) {
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
