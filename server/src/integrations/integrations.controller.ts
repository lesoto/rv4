import { Controller, HttpException, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { User } from '@/decorators/user.decorator';

import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reactive-website')
  @UseInterceptors(FileInterceptor('file'))
  reactiveWebsite(@User('id') userId: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('You must upload a valid JSON file.', HttpStatus.BAD_REQUEST);
    }

    return this.integrationsService.reactiveWebsite(userId, file.path);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reactive-website-v2')
  @UseInterceptors(FileInterceptor('file'))
  reactiveWebsiteV2(@User('id') userId: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('You must upload a valid JSON file.', HttpStatus.BAD_REQUEST);
    }

    return this.integrationsService.reactiveWebsiteV2(userId, file.path);
  }
}
