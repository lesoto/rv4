import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt.guard';
import { User } from '@/decorators/user.decorator';

import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { WebsiteService } from './website.service';

@Controller('website')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createWebsiteDto: CreateWebsiteDto, @User('id') userId: number) {
    return this.websiteService.create(createWebsiteDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllByUser(@User('id') userId: number) {
    return this.websiteService.findAllByUser(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('short/:shortId')
  findOneByShortId(
    @Param('shortId') shortId: string,
    @User('id') userId?: number,
    @Query('secretKey') secretKey?: string
  ) {
    return this.websiteService.findOneByShortId(shortId, userId, secretKey);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':username/:slug')
  findOneByIdentifier(
    @Param('username') username: string,
    @Param('slug') slug: string,
    @User('id') userId?: number,
    @Query('secretKey') secretKey?: string
  ) {
    return this.websiteService.findOneByIdentifier(username, slug, userId, secretKey);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @User('id') userId?: number) {
    return this.websiteService.findOne(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @User('id') userId: number, @Body() updateWebsiteDto: UpdateWebsiteDto) {
    return this.websiteService.update(+id, updateWebsiteDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User('id') userId: number) {
    return this.websiteService.remove(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @User('id') userId: number) {
    return this.websiteService.duplicate(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/sample')
  sample(@Param('id') id: string, @User('id') userId: number) {
    return this.websiteService.sample(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reset')
  reset(@Param('id') id: string, @User('id') userId: number) {
    return this.websiteService.reset(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@Param('id') id: string, @User('id') userId: number, @UploadedFile() file: Express.Multer.File) {
    return this.websiteService.uploadPhoto(+id, userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/photo')
  deletePhoto(@Param('id') id: string, @User('id') userId: number) {
    return this.websiteService.deletePhoto(+id, userId);
  }
}
