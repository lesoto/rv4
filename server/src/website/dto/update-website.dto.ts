import { PartialType } from '@nestjs/mapped-types';

import { Website } from '../entities/website.entity';

export class UpdateWebsiteDto extends PartialType(Website) {}
