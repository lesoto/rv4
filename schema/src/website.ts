import { General } from './general';
import { Metadata } from './metadata';
import { Section } from './section';
import { User } from './user';

export type Website = {
  id: number;
  shortId: string;
  name: string;
  slug: string;
  image: string;
  user: User;
  general: General;
  sections: Record<string, Section>;
  metadata: Metadata;
  public: boolean;
  createdAt: Date;
  updatedAt: Date;
};
