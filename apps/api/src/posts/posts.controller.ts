import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './posts.dto';
import { MembersService } from 'src/members/members.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { ExponatsService } from 'src/exponats/exponats.service';
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly membersService: MembersService,
    private readonly organisationsService: OrganisationsService,
    private readonly exponatsService: ExponatsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':exponatId')
  async create(
    @Body() createPostDto: CreatePostDto,
    @Param('exponatId') exponatId: string,
    @Req() req: any,
  ) {
    const organisationId =
      await this.organisationsService.findOrganisationByExponatId(exponatId);

    if (!organisationId) throw new BadRequestException("Exponat doesn't exist");

    const check = await this.membersService.checkForMember(
      req.user.id,
      organisationId,
    );

    if (!check) throw new UnauthorizedException('User is not a member');

    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
  ) {
    return this.postsService.update(+id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const exponat = await this.exponatsService.findExponatByPostId(id);
    const organisationId =
      await this.organisationsService.findOrganisationByExponatId(exponat);
    const check = await this.postsService.checkValidity(id, req.user.id);
    const admin = await this.membersService.hasAdminRights(
      req.user.id,
      organisationId,
    );

    if (!check && !admin && !(req.user.role === 'super'))
      throw new UnauthorizedException(
        "You cannor delete this pos because it is not yours and you don't have admin rights",
      );

    return this.postsService.remove(id);
  }
}
