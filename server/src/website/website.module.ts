import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';

import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';

import { Website } from './entities/website.entity';
import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Website]),
    MulterModule.register({ storage: memoryStorage() }),
    AuthModule,
    UsersModule,
  ],
  controllers: [WebsiteController],
  providers: [WebsiteService],
  exports: [WebsiteService],
})
export class WebsiteModule {}
