import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Award,
  Certificate,
  Education,
  Interest,
  Language,
  Project,
  Publication,
  Reference,
  Resume,
  Skill,
  Volunteer,
  WorkExperience,
} from '@reactive-resume/schema';
import csv from 'csvtojson';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { readFile, unlink } from 'fs/promises';
import { cloneDeep, get, isEmpty, merge } from 'lodash';
import StreamZip from 'node-stream-zip';
import { DeepPartial } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { FILENAME_TIMESTAMP } from '@/constants/index';
import defaultState from '@/resume/data/defaultState';
import { Resume as ResumeEntity } from '@/resume/entities/resume.entity';
import { ResumeService } from '@/resume/resume.service';

@Injectable()
export class IntegrationsService {
  constructor(private resumeService: ResumeService) {
    dayjs.extend(utc);
  }

  async reactiveResume(userId: number, path: string): Promise<ResumeEntity> {
    try {
      const jsonResume = JSON.parse(await readFile(path, 'utf8'));

      const resume: Partial<Resume> = cloneDeep(jsonResume);

      // Metadata
      const timestamp = dayjs().utc().format(FILENAME_TIMESTAMP);
      merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
        name: `Imported from Reactive Resume (${timestamp})`,
        slug: `imported-from-reactive-resume-${timestamp}`,
      });

      return this.resumeService.import(resume, userId);
    } catch {
      throw new HttpException('You must upload a valid JSON Resume file.', HttpStatus.BAD_REQUEST);
    } finally {
      await unlink(path);
    }
  }

  async reactiveResumeV2(userId: number, path: string): Promise<ResumeEntity> {
    try {
      const jsonResume = JSON.parse(await readFile(path, 'utf8'));

      const resume: Partial<Resume> = cloneDeep(defaultState);

      // Metadata
      const timestamp = dayjs().utc().format(FILENAME_TIMESTAMP);
      merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
        name: `Imported from Reactive Resume V2 (${timestamp})`,
        slug: `imported-from-reactive-resume-v2-${timestamp}`,
      });

      // Basics
      try {
        merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
          basics: {
            name: get(jsonResume, 'profile.firstName') + ' ' + get(jsonResume, 'profile.lastName'),
            headline: get(jsonResume, 'profile.subtitle'),
            photo: {
              url: get(jsonResume, 'profile.photograph'),
            },
            email: get(jsonResume, 'profile.email'),
            phone: get(jsonResume, 'profile.phone'),
            website: get(jsonResume, 'profile.website'),
            summary: get(jsonResume, 'objective'),
            location: {
              address: get(jsonResume, 'profile.address.line1'),
              postalCode: get(jsonResume, 'profile.address.pincode'),
              city: get(jsonResume, 'profile.address.city'),
            },
          },
        });
      } catch {
        // pass through
      }

      // Profiles
      try {
        const profiles: any[] = get(jsonResume, 'social.items', []);
        profiles.forEach((profile) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            basics: {
              profiles: [
                ...resume.basics.profiles,
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
        const work: any[] = get(jsonResume, 'work.items', []);
        work.forEach((item) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              work: {
                items: [
                  ...get(resume, 'sections.work.items', []),
                  {
                    id: uuidv4(),
                    name: get(item, 'company'),
                    position: get(item, 'position'),
                    summary: get(item, 'summary'),
                    url: get(item, 'website'),
                    date: {
                      start: this.parseDate(get(item, 'startDate')),
                      end: this.parseDate(get(item, 'endDate')),
                    },
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
        const education: any[] = get(jsonResume, 'education.items', []);
        education.forEach((item) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              education: {
                items: [
                  ...get(resume, 'sections.education.items', []),
                  {
                    id: uuidv4(),
                    institution: get(item, 'institution'),
                    degree: get(item, 'studyType'),
                    url: get(item, 'url'),
                    score: get(item, 'gpa'),
                    area: get(item, 'field'),
                    summary: get(item, 'summary'),
                    courses: get(item, 'courses', []),
                    date: {
                      start: this.parseDate(get(item, 'startDate')),
                      end: this.parseDate(get(item, 'endDate')),
                    },
                  } as Education,
                ],
              },
            },
          });
        });
      } catch {
        // pass through
      }

      // Awards
      try {
        const awards: any[] = get(jsonResume, 'awards.items', []);
        awards.forEach((award) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              awards: {
                items: [
                  ...get(resume, 'sections.awards.items', []),
                  {
                    id: uuidv4(),
                    title: get(award, 'title'),
                    awarder: get(award, 'awarder'),
                    summary: get(award, 'summary'),
                    date: this.parseDate(get(award, 'date')),
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
        const certifications: any[] = get(jsonResume, 'certifications.items', []);
        certifications.forEach((certificate) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              certifications: {
                items: [
                  ...get(resume, 'sections.certifications.items', []),
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
        const skills: any[] = get(jsonResume, 'skills.items', []);
        skills.forEach((skill) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              skills: {
                items: [
                  ...get(resume, 'sections.skills.items', []),
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
        const languages: any[] = get(jsonResume, 'languages.items', []);
        languages.forEach((language) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              languages: {
                items: [
                  ...get(resume, 'sections.languages.items', []),
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
        const hobbies: any[] = get(jsonResume, 'hobbies.items', []);
        hobbies.forEach((hobby) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              interests: {
                items: [
                  ...get(resume, 'sections.interests.items', []),
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

      // References
      try {
        const references: any[] = get(jsonResume, 'references.items', []);
        references.forEach((reference) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              references: {
                items: [
                  ...get(resume, 'sections.references.items', []),
                  {
                    id: uuidv4(),
                    name: get(reference, 'name'),
                    relationship: get(reference, 'position'),
                    phone: get(reference, 'phone'),
                    email: get(reference, 'email'),
                    summary: get(reference, 'summary'),
                  } as Reference,
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
        const projects: any[] = get(jsonResume, 'projects.items', []);
        projects.forEach((project) => {
          merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
            sections: {
              projects: {
                items: [
                  ...get(resume, 'sections.projects.items', []),
                  {
                    id: uuidv4(),
                    name: get(project, 'title'),
                    summary: get(project, 'summary'),
                    keywords: get(project, 'keywords'),
                    url: get(project, 'link'),
                    date: {
                      start: this.parseDate(get(project, 'startDate')),
                    },
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
      const template = get(jsonResume, 'metadata.template');
      const templateWhitelist = ['onyx', 'pikachu', 'gengar', 'castform', 'glalie'];
      merge<Partial<Resume>, DeepPartial<Resume>>(resume, {
        metadata: {
          ...get(resume, 'metadata'),
          typography: {
            family: {
              heading: get(jsonResume, 'metadata.font'),
              body: get(jsonResume, 'metadata.font'),
            },
            size: {
              heading: get(jsonResume, 'metadata.fontSize'),
              body: get(jsonResume, 'metadata.fontSize'),
            },
          },
          page: {
            format: 'A4',
          },
          theme: {
            background: get(jsonResume, 'metadata.colors.background'),
            primary: get(jsonResume, 'metadata.colors.primary'),
            text: get(jsonResume, 'metadata.colors.text'),
          },
          locale: get(jsonResume, 'metadata.language'),
          template: templateWhitelist.includes(template) ? template : 'kakuna',
        },
      });

      return this.resumeService.import(resume, userId);
    } catch {
      throw new HttpException('You must upload a valid JSON Resume file.', HttpStatus.BAD_REQUEST);
    } finally {
      await unlink(path);
    }
  }

  private parseDate = (date: string): string => {
    return isEmpty(date) ? '' : dayjs(date).utc().toISOString();
  };
}
