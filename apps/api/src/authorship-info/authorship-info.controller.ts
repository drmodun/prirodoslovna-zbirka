import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthorshipInfoService } from './authorship-info.service';
import {
  CreateAuthorshipInfoDto,
  UpdateAuthorshipInfoDto,
} from './dto/authorship-info.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';

@Controller('authorship-info')
export class AuthorshipInfoController {
  constructor(private readonly authorshipInfoService: AuthorshipInfoService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(
    @Body() createAuthorshipInfoDto: CreateAuthorshipInfoDto,
    @Req() req: any,
  ) {
    createAuthorshipInfoDto.authorId = req.user.id;
    return await this.authorshipInfoService.create(createAuthorshipInfoDto);
  }

  @Get()
  async findAll() {
    return await this.authorshipInfoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.authorshipInfoService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateAuthorshipInfoDto: UpdateAuthorshipInfoDto,
  ) {
    return await this.authorshipInfoService.update(
      id,
      updateAuthorshipInfoDto,
      req.user.id,
    );
  }
}
