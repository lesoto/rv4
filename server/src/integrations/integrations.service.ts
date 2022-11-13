import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Award,
  Certificate,
  Education,
  Footer,
  Interest,
  Language,
  Project,
  Publication,
  Skill,
  Volunteer,
  Website,
  WorkExperience,
} from '@reactive-website/schema';
import csv from 'csvtojson';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { readFile, unlink } from 'fs/promises';
import { cloneDeep, get, isEmpty, merge } from 'lodash';
import StreamZip from 'node-stream-zip';
import { DeepPartial } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { FILENAME_TIMESTAMP } from '@/constants/index';
import defaultState from '@/website/data/defaultState';
import { Website as WebsiteEntity } from '@/website/entities/website.entity';
import { WebsiteService } from '@/website/website.service';

@Injectable()
export class IntegrationsService {
  constructor(private websiteService: WebsiteService) {
    dayjs.extend(utc);
  }

  async reactiveWebsite(userId: number, path: string): Promise<WebsiteEntity> {
    try {
      const jsonWebsite = JSON.parse(await readFile(path, 'utf8'));

      const website: Partial<Website> = cloneDeep(jsonWebsite);

      // Metadata
      const timestamp = dayjs().utc().format(FILENAME_TIMESTAMP);
      merge<Partial<Website>, DeepPartial<Website>>(website, {
        name: `Imported from Reactive Website (${timestamp})`,
        slug: `imported-from-reactive-website-${timestamp}`,
      });

      return this.websiteService.import(website, userId);
    } catch {
      throw new HttpException('You must upload a valid JSON Website file.', HttpStatus.BAD_REQUEST);
    } finally {
      await unlink(path);
    }
  }

  async reactiveWebsiteV2(userId: number, path: string): Promise<WebsiteEntity> {
    try {
      const jsonWebsite = JSON.parse(await readFile(path, 'utf8'));

      const website: Partial<Website> = cloneDeep(defaultState);

      // Metadata
      const timestamp = dayjs().utc().format(FILENAME_TIMESTAMP);
      merge<Partial<Website>, DeepPartial<Website>>(website, {
        name: `Imported from Reactive Website V2 (${timestamp})`,
        slug: `imported-from-reactive-website-v2-${timestamp}`,
      });

      // Basics
      try {
        merge<Partial<Website>, DeepPartial<Website>>(website, {
          basics: {
            name: get(jsonWebsite, 'profile.firstName') + ' ' + get(jsonWebsite, 'profile.lastName'),
            headline: get(jsonWebsite, 'profile.subtitle'),
            photo: {
              url: get(jsonWebsite, 'profile.photograph'),
            },
            //email: get(jsonWebsite, 'email'),
            //phone: get(jsonWebsite, 'contact.phone'),
            //website: get(jsonWebsite, 'basics.contact.website'),
            summary: get(jsonWebsite, 'objective'),
            contact: {
              address: get(jsonWebsite, 'profile.address.line1'),
              zipCode: get(jsonWebsite, 'profile.address.pincode'),
              city: get(jsonWebsite, 'profile.address.city'),
            },
          },
        });
      } catch {
        // pass through
      }

      // Profiles
      try {
        const profiles: any[] = get(jsonWebsite, 'social.items', []);
        profiles.forEach((profile) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            basics: {
              social: [
                ...website.basics.social,
                {
                  id: uuidv4(),
                  url: get(profile, 'url'),
                  network: get(profile, 'network'),
                  username: get(profile, 'username'),
                },
              ],
            },
          });
        });
      } catch {
        // pass through
      }

      // Work
      try {
        const work: any[] = get(jsonWebsite, 'work.items', []);
        work.forEach((item) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              work: {
                items: [
                  ...get(website, 'sections.work.items', []),
                  {
                    id: uuidv4(),
                    name: get(item, 'company'),
                    position: get(item, 'position'),
                    summary: get(item, 'summary'),
                    url: get(item, 'website'),
                  } as WorkExperience,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Education
      try {
        const education: any[] = get(jsonWebsite, 'education.items', []);
        education.forEach((item) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              education: {
                items: [
                  ...get(website, 'sections.education.items', []),
                  {
                    id: uuidv4(),
                    institution: get(item, 'institution'),
                    degree: get(item, 'studyType'),
                    url: get(item, 'url'),
                    score: get(item, 'gpa'),
                    area: get(item, 'field'),
                    summary: get(item, 'summary'),
                    courses: get(item, 'courses', []),
                  } as Education,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Blog
      try {
        const blog: any[] = get(jsonWebsite, 'blog.items', []);
        blog.forEach((blog) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              blog: {
                items: [
                  ...get(website, 'sections.blog.items', []),
                  {
                    id: uuidv4(),
                    title: get(blog, 'title'),
                    category: get(blog, 'category'),
                    summary: get(blog, 'summary'),
                    date: this.parseDate(get(blog, 'date')),
                  } as Award,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Certifications
      try {
        const certifications: any[] = get(jsonWebsite, 'certifications.items', []);
        certifications.forEach((certificate) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              certifications: {
                items: [
                  ...get(website, 'sections.certifications.items', []),
                  {
                    id: uuidv4(),
                    name: get(certificate, 'title'),
                    issuer: get(certificate, 'issuer'),
                    summary: get(certificate, 'summary'),
                    date: this.parseDate(get(certificate, 'date')),
                  } as Certificate,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Skills
      try {
        const skills: any[] = get(jsonWebsite, 'skills.items', []);
        skills.forEach((skill) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              skills: {
                items: [
                  ...get(website, 'sections.skills.items', []),
                  {
                    id: uuidv4(),
                    name: get(skill, 'name'),
                    level: get(skill, 'level'),
                    levelNum: 5,
                  } as Skill,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Languages
      try {
        const languages: any[] = get(jsonWebsite, 'languages.items', []);
        languages.forEach((language) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              languages: {
                items: [
                  ...get(website, 'sections.languages.items', []),
                  {
                    id: uuidv4(),
                    name: get(language, 'name'),
                    level: get(language, 'fluency'),
                    levelNum: 5,
                  } as Language,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Hobbies
      try {
        const hobbies: any[] = get(jsonWebsite, 'hobbies.items', []);
        hobbies.forEach((hobby) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              interests: {
                items: [
                  ...get(website, 'sections.interests.items', []),
                  {
                    id: uuidv4(),
                    name: get(hobby, 'name'),
                    keywords: get(hobby, 'keywords', []),
                  } as Interest,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // footer
      try {
        const footer: any[] = get(jsonWebsite, 'footer.items', []);
        footer.forEach((footerItem) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              footer: {
                items: [
                  ...get(website, 'sections.footer.items', []),
                  {
                    id: uuidv4(),
                    terms: get(footerItem, 'terms'),
                    privacy: get(footerItem, 'privacy'),
                    phone: get(footerItem, 'phone'),
                    email: get(footerItem, 'email'),
                    summary: get(footerItem, 'summary'),
                  } as Footer,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Projects
      try {
        const projects: any[] = get(jsonWebsite, 'projects.items', []);
        projects.forEach((project) => {
          merge<Partial<Website>, DeepPartial<Website>>(website, {
            sections: {
              projects: {
                items: [
                  ...get(website, 'sections.projects.items', []),
                  {
                    id: uuidv4(),
                    name: get(project, 'title'),
                    summary: get(project, 'summary'),
                    keywords: get(project, 'keywords'),
                    url: get(project, 'link'),
                  } as Project,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Metadata
      const template = get(jsonWebsite, 'metadata.template');
      const templateWhitelist = ['onyx', 'pikachu', 'gengar', 'castform', 'glalie'];
      merge<Partial<Website>, DeepPartial<Website>>(website, {
        metadata: {
          ...get(website, 'metadata'),
          typography: {
            family: {
              heading: get(jsonWebsite, 'metadata.font'),
              body: get(jsonWebsite, 'metadata.font'),
            },
            size: {
              heading: get(jsonWebsite, 'metadata.fontSize'),
              body: get(jsonWebsite, 'metadata.fontSize'),
            },
          },
          page: {
            format: 'A4',
          },
          theme: {
            background: get(jsonWebsite, 'metadata.colors.background'),
            primary: get(jsonWebsite, 'metadata.colors.primary'),
            text: get(jsonWebsite, 'metadata.colors.text'),
          },
          locale: get(jsonWebsite, 'metadata.language'),
          template: templateWhitelist.includes(template) ? template : 'kakuna',
        },
      });

      return this.websiteService.import(website, userId);
    } catch {
      throw new HttpException('You must upload a valid JSON Website file.', HttpStatus.BAD_REQUEST);
    } finally {
      await unlink(path);
    }
  }

  private parseDate = (date: string): string => {
    return isEmpty(date) ? '' : dayjs(date).utc().toISOString();
  };
}
