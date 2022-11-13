import { DateRange } from './atoms';
import { Social } from './general';

export type Team = {
  id?: string;
  name: string;
  position: string;
  url?: string;
  summary?: string;
};

export type Education = {
  id?: string;
  institution: string;
  degree: string;
  area?: string;
  score?: string;
  url?: string;
  summary?: string;
  courses?: string[];
};

export type Blog = {
  id?: string;
  title: string;
  category: string;
  date?: string;
  url?: string;
  summary?: string;
};

export type Volunteer = {
  id?: string;
  organization: string;
  position: string;
  date?: DateRange;
  url?: string;
  summary?: string;
};

export type Publication = {
  id?: string;
  name: string;
  publisher: string;
  date?: string;
  url?: string;
  summary?: string;
};

export type Skill = {
  id?: string;
  name: string;
  level?: string;
  levelNum: number;
  keywords?: string[];
};

export type Language = {
  id?: string;
  name: string;
  level: string;
  levelNum: number;
};

export type Interest = {
  id?: string;
  name: string;
  keywords?: string[];
};

export type CTA = {
  id?: string;
  name: string;
  subtitle: string;
  date?: string;
  url?: string;
  summary?: string;
};

export type Project = {
  id?: string;
  name: string;
  description: string;
  date?: DateRange;
  url?: string;
  summary?: string;
  keywords?: string[];
};

export type Footer = {
  id?: string;
  terms: string;
  privacy: string;
  phone?: string;
  email?: string;
  summary?: string;
};

export type Custom = {
  id?: string;
  title: string;
  subtitle?: string;
  date?: DateRange;
  url?: string;
  level?: string;
  levelNum?: number;
  summary?: string;
  keywords?: string[];
};

export type ListItem =
  | Blog
  | CTA
  | Education
  | Interest
  | Language
  | Social
  | Project
  | Publication
  | Footer
  | Skill
  | Volunteer
  | Team
  | Custom;

export type SectionType = 'basic' | 'custom';

export type SectionPath = `sections.${string}`;

export type Section = {
  id?: string;
  name: string;
  type: SectionType;
  columns: number;
  visible: boolean;
  items: ListItem[];
};
