import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { WorksService } from './works.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { CreateWorkDto, UpdateWorkDto, WorkQuery } from './dto/works.entity';
import {
  PaginationRequest,
  SortingEnum,
  SortingRequest,
  WorkResponseExtended,
  WorkResponseShort,
} from '@biosfera/types';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth-guard';
import { PaginationParams } from 'src/config/pagination';
import { SortingParams } from 'src/config/sorting';
import { isModerator, isSuperUser } from 'src/auth/roles';

@Controller('works')
@ApiTags('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organisationId')
  async create(
    @Req() req: any,
    @Param('organisationId') organisationId: string,
    @Body() createWorkDto: CreateWorkDto,
  ) {
    createWorkDto.authorId = req?.user?.id;
    createWorkDto.organisationId = organisationId;

    if (
      isSuperUser(req?.user) ||
      (await this.worksService.checkIsAdmin(req?.user?.id, organisationId))
    ) {
      createWorkDto.isApproved = true;
      createWorkDto.approvedBy = req?.user?.id;
    }

    const check =
      isSuperUser(req?.user) ||
      (await this.worksService.checkMembership(req.user.id, organisationId));

    if (!check)
      throw new UnauthorizedException(
        'Sorry, you cannot post a work to' + organisationId,
      );

    const entity = await this.worksService.create(createWorkDto);

    if (!entity) throw new BadRequestException('Work not created');
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll(
    @Req() req: any,
    @PaginationParams() paginationParam?: PaginationRequest,
    @SortingParams([SortingEnum.TITLE, SortingEnum.ORGANISATION])
    sorting?: SortingRequest,
    @Query() query?: WorkQuery,
  ) {
    const isAdmin = isModerator(req?.user);

    const check =
      !isAdmin &&
      query?.organisationId &&
      (await this.worksService.checkIsAdmin(
        req?.user?.id,
        query.organisationId,
      ));

    const data = await this.worksService.findAll(
      query,
      sorting,
      paginationParam,
      !check,
    );

    const mapped = data.map((item) => {
      return {
        auhtorName: item.author.username,
        authorId: item.authorId,
        title: item.title,
        description: item.description,
        organisationId: item.organisationId,
        tags: item.tags,
        type: item.type,
        organisationName: item.organisation.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        amountOfSaves: item._count.SavedWorks,
        poster: item.poster,
        id: item.id,
        isApproved: item.isApproved,
      } as WorkResponseShort;
    });

    return mapped;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    // Pending works are loaded too; who may see them is decided below.
    const entity = await this.worksService.findOne(id, false);

    if (!entity) throw new BadRequestException('Work not found');

    const check =
      !entity.isApproved &&
      (await this.worksService.checkRights(req?.user?.id, id));

    if (!entity.isApproved && !check)
      throw new UnauthorizedException('Work not approved');

    const mapped: WorkResponseExtended = {
      approvedById: entity.approvedBy,
      approvedByName: entity.approver?.username,
      auhtorName: entity.author.username,
      authorId: entity.authorId,
      amountOfSaves: entity._count.SavedWorks,
      document: entity.document,
      description: entity.description,
      firstPublicationDate: entity.createdAt,
      id: entity.id,
      organisationId: entity.organisationId,
      organisationName: entity.organisation.name,
      poster: entity.poster,
      tags: entity.tags,
      type: entity.type,
      presentation: entity.presentation,
      title: entity.title,
      updatedAt: entity.updatedAt,
    };

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateWorkDto: UpdateWorkDto,
  ) {
    const authorCheck = await this.worksService.checkRights(req.user.id, id);

    if (!authorCheck)
      throw new UnauthorizedException(
        'Not enough rights to perform this action',
      );

    const entity = await this.worksService.update(id, updateWorkDto);

    if (!entity) throw new BadRequestException('Work not updated');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const check = await this.worksService.checkRights(req.user.id, id);

    if (!check)
      throw new UnauthorizedException(
        'Not enough rights to perform this action',
      );

    const entity = await this.worksService.remove(id);

    if (!entity) throw new BadRequestException('Work not removed');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/approval')
  async approve(@Req() req: any, @Param('id') id: string) {
    const check = await this.worksService.checkRights(req.user.id, id, true);

    if (!check)
      throw new UnauthorizedException(
        'Not enough rights to perform this action',
      );

    const entity = await this.worksService.toggleApproval(id, req.user.id);

    if (!entity) throw new BadRequestException('Work not approved');
  }
}
