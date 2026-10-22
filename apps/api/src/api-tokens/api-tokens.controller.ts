import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionOnly } from 'src/auth/session-only';
import { ApiTokensService } from './api-tokens.service';
import { CreateApiTokenDto } from './dto/api-tokens.dto';

// The logged-in user's own personal access tokens. Managing them needs a
// login, so a leaked token cannot make more tokens or hide itself.
@Controller('auth/tokens')
@ApiTags('auth')
@SessionOnly()
export class ApiTokensController {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  @Post()
  async create(@Body() dto: CreateApiTokenDto, @Req() req: any) {
    return await this.apiTokensService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return await this.apiTokensService.findAll(req.user.id);
  }

  // Revokes every active token, e.g. after a password reset.
  @Delete()
  async revokeAll(@Req() req: any) {
    return await this.apiTokensService.revokeAll(req.user.id);
  }

  @Delete(':id')
  async revoke(@Param('id') id: string, @Req() req: any) {
    return await this.apiTokensService.revoke(req.user.id, id);
  }

  @Get(':id/usage')
  async usage(@Param('id') id: string, @Req() req: any) {
    return await this.apiTokensService.usage(req.user.id, id);
  }
}
