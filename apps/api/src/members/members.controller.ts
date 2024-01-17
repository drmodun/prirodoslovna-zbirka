import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MemberRoleType } from './members.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {} //TODO: Remove unused response objects, just send codes if needed

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':organisationId')
  async makeRequest(
    @Req() req,
    @Param('organisationId') organisationId: string,
  ) {
    const userId = req.user.id;

    const membership = await this.membersService.makeRequest(
      userId,
      organisationId,
    );

    return membership;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':organisationId/leave')
  async leaveOrganisation(
    @Req() req,
    @Param('organisationId') organisationId: string,
  ) {
    const authorId = req.user.id;

    const membership = await this.membersService.leaveOrganisation(
      authorId,
      organisationId,
    );

    return membership;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':organisationId/:userId')
  async editMembershipStatus(
    @Req() req,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
    @Body() { role }: { role: MemberRoleType },
  ) {
    if (role === MemberRoleType.OWNER)
      return new BadRequestException("You can't make a member an owner");

    const authorId = req.user.id;
    const check = await this.membersService.hasAdminRights(
      authorId,
      organisationId,
    );

    if (!check) return new BadRequestException("You don't have admin rights");

    const membership = await this.membersService.editMemberRole(
      userId,
      organisationId,
      role,
    );

    return membership;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organisationId/:userId/owner')
  async ownerEdit(
    @Req() req,
    @Param('organisationId') organisationId: string,
    @Param('userId') userId: string,
    @Body() { role }: { role: MemberRoleType },
  ) {
    const authorId = req.user.id;
    const check = await this.membersService.hasOwnerRights(
      authorId,
      organisationId,
    );

    if (!check) return new BadRequestException("You don't have owner rights");

    const membership = await this.membersService.ownerEditMemberRole(
      userId,
      organisationId,
      role,
    );

    return membership;
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

    if (!check) return new BadRequestException("You don't have owner rights");

    const membership = await this.membersService.transferOwnership(
      authorId,
      organisationId,
      userId,
    );

    return membership;
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

    if (!check) return new BadRequestException("You don't have admin rights");

    const membership = await this.membersService.addMember(
      userId,
      organisationId,
    );

    return membership;
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

    if (!check) return new BadRequestException("You don't have admin rights");

    const membership = await this.membersService.removeMember(
      userId,
      organisationId,
    );

    return membership;
  }

  
}
