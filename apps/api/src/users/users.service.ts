import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: RegisterUserDto) {
    return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
