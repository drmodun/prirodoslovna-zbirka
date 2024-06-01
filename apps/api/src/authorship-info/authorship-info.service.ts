import { Injectable } from '@nestjs/common';
import {
  CreateAuthorshipInfoDto,
  UpdateAuthorshipInfoDto,
} from './dto/authorship-info.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorshipInfoService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createAuthorshipInfoDto: CreateAuthorshipInfoDto) {
    return await this.prisma.authorshipInfo.create({
      data: createAuthorshipInfoDto,
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
      data: updateAuthorshipInfoDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} authorshipInfo`;
  }
}
