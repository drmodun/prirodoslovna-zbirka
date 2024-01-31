import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EditMembershipDto, MemberRoleType } from './members.dto';
@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {} //TODO: Remove unused response objects, just send codes if needed

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organisationId')
  async makeRequest(
    @Req() req,
    @Param('organisationId') organisationId: string,
  ) {
    const userId = req.user.id;

    await this.membersService.makeRequest(userId, organisationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':organisationId/leave')
  async leaveOrganisation(
    @Req() req,
    @Param('organisationId') organisationId: string,
  ) {
    const authorId = req.user.id;

    await this.membersService.leaveOrganisation(authorId, organisationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':organisationId/:userId')
  async editMembershipStatus(
    @Req() req,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
    @Body() editMembershipDto: EditMembershipDto,
  ) {
    if (editMembershipDto.role === MemberRoleType.OWNER)
      return new UnauthorizedException("You can't make a member an owner");

    const authorId = req.user.id;
    const check = await this.membersService.hasAdminRights(
      authorId,
      organisationId,
    );

    if (!check) return new UnauthorizedException("You don't have admin rights");

    await this.membersService.editMemberRole(
      userId,
      organisationId,
      editMembershipDto.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organisationId/:userId/owner')
  async ownerEdit(
    @Req() req,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
    @Body() editMembershipDto: EditMembershipDto,
  ) {
    const authorId = req.user.id;
    const check = await this.membersService.hasOwnerRights(
      authorId,
      organisationId,
    );

    if (!check) return new UnauthorizedException("You don't have owner rights");

    await this.membersService.ownerEditMemberRole(
      userId,
      organisationId,
      editMembershipDto.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':organisationId/:userId/transfer')
  async transferOwnership(
    @Req() req,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
  ) {
    const authorId = req.user.id;
    const check = await this.membersService.hasOwnerRights(
      authorId,
      organisationId,
    );

    if (!check) return new UnauthorizedException("You don't have owner rights");

    await this.membersService.transferOwnership(
      authorId,
      organisationId,
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organisationId/:userId/add')
  async addMember(
    @Req() req,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
  ) {
    const authorId = req.user.id;
    const check = await this.membersService.hasAdminRights(
      authorId,
      organisationId,
    );

    if (!check) return new UnauthorizedException("You don't have admin rights");

    await this.membersService.addMember(userId, organisationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':organisationId/:userId/remove')
  async removeMember(
    @Req() req,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
  ) {
    const authorId = req.user.id;
    const check = await this.membersService.hasAdminRights(
      authorId,
      organisationId,
    );

    if (!check) return new UnauthorizedException("You don't have admin rights");

    await this.membersService.removeMember(userId, organisationId);
  }
}
