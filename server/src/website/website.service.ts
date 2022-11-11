import { DeleteObjectCommand, PutObjectCommand, S3, S3Client } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Website as WebsiteSchema } from '@reactive-website/schema';
import fs from 'fs/promises';
import { isEmpty, pick, sample, set } from 'lodash';
import { nanoid } from 'nanoid';
import { extname } from 'path';
import { Repository } from 'typeorm';

import { PostgresErrorCode } from '@/database/errorCodes.enum';
import { UsersService } from '@/users/users.service';

import { covers } from './data/covers';
import defaultState from './data/defaultState';
import sampleData from './data/sampleData';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { Website } from './entities/website.entity';

export const SHORT_ID_LENGTH = 8;

@Injectable()
export class WebsiteService {
  private s3Client: S3Client;
  private s3Enabled: boolean;

  constructor(
    @InjectRepository(Website) private websiteRepository: Repository<Website>,
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    this.s3Enabled = !isEmpty(configService.get<string>('storage.bucket'));

    if (this.s3Enabled) {
      this.s3Client = new S3({
        endpoint: configService.get<string>('storage.endpoint'),
        region: configService.get<string>('storage.region'),
        credentials: {
          accessKeyId: configService.get<string>('storage.accessKey'),
          secretAccessKey: configService.get<string>('storage.secretKey'),
        },
      });
    }
  }

  async create(createWebsiteDto: CreateWebsiteDto, userId: number) {
    try {
      const user = await this.usersService.findById(userId);

      const shortId = nanoid(SHORT_ID_LENGTH);
      const image = `/images/covers/${sample(covers)}`;

      const website = this.websiteRepository.create({
        ...defaultState,
        ...createWebsiteDto,
        shortId,
        image,
        user,
        basics: {
          ...defaultState.basics,
          name: user.name,
        },
      });

      return await this.websiteRepository.save(website);
    } catch (error: any) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'A website with the same slug already exists, please enter a unique slug and try again.',
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        'Something went wrong. Please try again later, or raise an issue on GitHub if the problem persists.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async import(importWebsiteDto: Partial<WebsiteSchema>, userId: number) {
    try {
      const user = await this.usersService.findById(userId);

      const shortId = nanoid(SHORT_ID_LENGTH);
      const image = `/images/covers/${sample(covers)}`;

      const website = this.websiteRepository.create({
        ...defaultState,
        ...importWebsiteDto,
        shortId,
        image,
        user,
      });

      return this.websiteRepository.save(website);
    } catch {
      throw new HttpException(
        'Something went wrong. Please try again later, or raise an issue on GitHub if the problem persists.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  findAll() {
    return this.websiteRepository.find();
  }

  findAllByUser(userId: number) {
    return this.websiteRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: number, userId?: number) {
    const website = await this.websiteRepository.findOne({ where: { id } });

    if (!website) {
      throw new HttpException('The website you are looking does not exist, or maybe never did?', HttpStatus.NOT_FOUND);
    }

    const isPrivate = !website.public;
    const isNotOwner = website.user.id !== userId;

    if (isPrivate && isNotOwner) {
      throw new HttpException('The website you are looking does not exist, or maybe never did?', HttpStatus.NOT_FOUND);
    }

    return website;
  }

  async findOneByShortId(shortId: string, userId?: number, secretKey?: string) {
    const website = await this.websiteRepository.findOne({ where: { shortId } });

    if (!website) {
      throw new HttpException('The website you are looking does not exist, or maybe never did?', HttpStatus.NOT_FOUND);
    }

    const isPrivate = !website.public;
    const isOwner = website.user.id === userId;
    const isInternal = secretKey === this.configService.get<string>('app.secretKey');

    if (!isInternal && isPrivate && !isOwner) {
      throw new HttpException('The website you are looking does not exist, or maybe never did?', HttpStatus.NOT_FOUND);
    }

    return website;
  }

  async findOneByIdentifier(username: string, slug: string, userId?: number, secretKey?: string) {
    const website = await this.websiteRepository.findOne({ where: { user: { username }, slug } });

    if (!website) {
      throw new HttpException('The website you are looking does not exist, or maybe never did?', HttpStatus.NOT_FOUND);
    }

    const isPrivate = !website.public;
    const isOwner = website.user.id === userId;
    const isInternal = secretKey === this.configService.get<string>('app.secretKey');

    if (!isInternal && isPrivate && !isOwner) {
      throw new HttpException('The website you are looking does not exist, or maybe never did?', HttpStatus.NOT_FOUND);
    }

    return website;
  }

  async update(id: number, updateWebsiteDto: UpdateWebsiteDto, userId: number) {
    const website = await this.findOne(id, userId);

    const updatedWebsite = {
      ...website,
      ...updateWebsiteDto,
    };

    return this.websiteRepository.save<Website>(updatedWebsite);
  }

  async remove(id: number, userId: number) {
    await this.websiteRepository.delete({ id, user: { id: userId } });
  }

  async duplicate(id: number, userId: number) {
    try {
      const originalWebsite = await this.findOne(id, userId);

      const shortId = nanoid(SHORT_ID_LENGTH);
      const image = `/images/covers/${sample(covers)}`;

      const duplicatedWebsite: Partial<Website> = {
        ...pick(originalWebsite, ['name', 'slug', 'basics', 'metadata', 'sections', 'public']),
        name: `${originalWebsite.name} Copy`,
        slug: `${originalWebsite.slug}-copy`,
        shortId,
        image,
      };

      const website = this.websiteRepository.create({
        ...duplicatedWebsite,
        user: { id: userId },
      });

      return this.websiteRepository.save(website);
    } catch (error: any) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'A website with the same slug already exists, please enter a unique slug and try again.',
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        'Something went wrong. Please try again later, or raise an issue on GitHub if the problem persists.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async sample(id: number, userId: number) {
    const website = await this.findOne(id, userId);

    const sampleWebsite = { ...website, ...sampleData };

    return this.websiteRepository.save<Website>(sampleWebsite);
  }

  async reset(id: number, userId: number) {
    const website = await this.findOne(id, userId);

    const prevWebsite = pick(website, ['id', 'shortId', 'name', 'slug', 'image', 'user', 'createdAt']);
    const nextWebsite = { ...prevWebsite, ...defaultState };

    return this.websiteRepository.update(id, nextWebsite);
  }

  async uploadPhoto(id: number, userId: number, file: Express.Multer.File) {
    const website = await this.findOne(id, userId);

    const filename = new Date().getTime() + extname(file.originalname);
    let updatedWebsite = null;

    if (this.s3Enabled) {
      const urlPrefix = this.configService.get<string>('storage.urlPrefix');
      const key = `uploads/${userId}/${id}/${filename}`;
      const publicUrl = urlPrefix + key;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.get<string>('storage.bucket'),
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
        })
      );
      updatedWebsite = set(website, 'basics.photo.url', publicUrl);
    } else {
      const path = `${__dirname}/../assets/uploads/${userId}/${id}/`;
      const serverUrl = this.configService.get<string>('app.serverUrl');

      try {
        await fs.mkdir(path, { recursive: true });
        await fs.writeFile(path + filename, file.buffer);

        updatedWebsite = set(website, 'basics.photo.url', `${serverUrl}/assets/uploads/${userId}/${id}/` + filename);
      } catch (error) {
        throw new HttpException(
          'Something went wrong. Please try again later, or raise an issue on GitHub if the problem persists.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    return this.websiteRepository.save<Website>(updatedWebsite);
  }

  async deletePhoto(id: number, userId: number) {
    const website = await this.findOne(id, userId);
    const publicUrl = website.basics.photo.url;

    if (this.s3Enabled) {
      const urlPrefix = this.configService.get<string>('storage.urlPrefix');
      const key = publicUrl.replace(urlPrefix, '');

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.configService.get<string>('storage.bucket'),
          Key: key,
        })
      );
    } else {
      const serverUrl = this.configService.get<string>('app.serverUrl');
      const filePath = __dirname + '/..' + website.basics.photo.url.replace(serverUrl, '');

      const isValidFile = (await fs.stat(filePath)).isFile();

      if (isValidFile) {
        await fs.unlink(filePath);
      }
    }

    const updatedWebsite = set(website, 'basics.photo.url', '');

    return this.websiteRepository.save<Website>(updatedWebsite);
  }
}
