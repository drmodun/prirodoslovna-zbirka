import { Injectable } from '@nestjs/common';
import {
  CreateAuthorshipInfoDto,
  UpdateAuthorshipInfoDto,
} from './dto/authorship-info.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorshipInfoService {
  constructor(private readonly prisma: PrismaService) {}
  // The date arrives as an ISO date string ("2024-05-01" from a date
  // picker), which Prisma only accepts as a Date.
  private static withDate<T extends { dateOfOccurrence?: Date | string }>(
    dto: T,
  ) {
    return dto.dateOfOccurrence
      ? { ...dto, dateOfOccurrence: new Date(dto.dateOfOccurrence) }
      : dto;
  }

  async create(createAuthorshipInfoDto: CreateAuthorshipInfoDto) {
    return await this.prisma.authorshipInfo.create({
      data: AuthorshipInfoService.withDate(createAuthorshipInfoDto),
    });
  }

  async findAll() {
    return await this.prisma.authorshipInfo.findMany();
  }

  async findOne(id: string) {
    return this.prisma.authorshipInfo.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: string,
    updateAuthorshipInfoDto: UpdateAuthorshipInfoDto,
    userId: string,
  ) {
    return await this.prisma.authorshipInfo.update({
      where: {
        id,
        authorId: userId,
      },
      data: AuthorshipInfoService.withDate(updateAuthorshipInfoDto),
    });
  }

  remove(id: number) {
    return `This action removes a #${id} authorshipInfo`;
  }
}
