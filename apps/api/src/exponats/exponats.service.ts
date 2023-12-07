import { Injectable } from '@nestjs/common';
import { CreateExponatDto } from './dto/exponats.dto';
import { UpdateExponatDto } from './dto/update-exponat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExponatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExponatDto: CreateExponatDto) {
    return await this.prisma.exponat.create({
      data: createExponatDto,
    });
  }

  async findAll() {
    return `This action returns all exponats`;
  }

  async findOne(id: string) {
    return await this.prisma.exponat.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, request: UpdateExponatDto) {
    await this.prisma.exponat.update({
      where: {
        id,
      },
      data: request,
    });
  }

  async remove(id: string) {
    await this.prisma.exponat.delete({
      where: {
        id,
      },
    });
  }
}
