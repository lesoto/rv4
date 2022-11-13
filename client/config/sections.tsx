import {
  Architecture,
  CardGiftcard,
  Category,
  Coffee,
  Download,
  EmojiEvents,
  FontDownload,
  Groups,
  Language,
  Link as LinkIcon,
  Map,
  Margin,
  MenuBook,
  Palette,
  Person,
  Sailing,
  School,
  Settings as SettingsIcon,
  Share,
  Style,
  Twitter,
  VolunteerActivism,
  Work,
} from '@mui/icons-material';
import { Section as SectionRecord } from '@reactive-website/schema';
import isEmpty from 'lodash/isEmpty';

import General from '@/components/build/LeftSidebar/sections/General';
import Contact from '@/components/build/LeftSidebar/sections/Contact';
import Social from '@/components/build/LeftSidebar/sections/Social';
import Section from '@/components/build/LeftSidebar/sections/Section';
import CustomCSS from '@/components/build/RightSidebar/sections/CustomCSS';
import Export from '@/components/build/RightSidebar/sections/Export';
import Layout from '@/components/build/RightSidebar/sections/Layout';
import Links from '@/components/build/RightSidebar/sections/Links';
import Settings from '@/components/build/RightSidebar/sections/Settings';
import Sharing from '@/components/build/RightSidebar/sections/Sharing';
import Templates from '@/components/build/RightSidebar/sections/Templates';
import Theme from '@/components/build/RightSidebar/sections/Theme';
import Typography from '@/components/build/RightSidebar/sections/Typography';
import { SidebarSection } from '@/types/app';

export const left: SidebarSection[] = [
  {
    id: 'general',
    icon: <Person />,
    component: <General />,
  },
  {
    id: 'team',
    icon: <Work />,
    component: <Section path="sections.team" titleKey="name" subtitleKey="position" isEditable isHideable />,
  },
  {
    id: 'education',
    icon: <School />,
    component: <Section path="sections.education" titleKey="institution" subtitleKey="area" isEditable isHideable />,
  },
  {
    id: 'blog',
    icon: <EmojiEvents />,
    component: <Section path="sections.blog" titleKey="title" subtitleKey="category" isEditable isHideable />,
  },
  {
    id: 'call_to_actions',
    icon: <CardGiftcard />,
    component: <Section path="sections.call_to_actions" titleKey="name" subtitleKey="subtitle" isEditable isHideable />,
  },
  {
    id: 'publications',
    icon: <MenuBook />,
    component: <Section path="sections.publications" titleKey="name" subtitleKey="publisher" isEditable isHideable />,
  },
  {
    id: 'skills',
    icon: <Architecture />,
    component: <Section path="sections.skills" titleKey="name" subtitleKey="level" isEditable isHideable />,
  },
  {
    id: 'languages',
    icon: <Language />,
    component: <Section path="sections.languages" titleKey="name" subtitleKey="level" isEditable isHideable />,
  },
  {
    id: 'interests',
    icon: <Sailing />,
    component: <Section path="sections.interests" titleKey="name" subtitleKey="keywords" isEditable isHideable />,
  },
  {
    id: 'volunteer',
    icon: <VolunteerActivism />,
    component: (
      <Section path="sections.volunteer" titleKey="organization" subtitleKey="position" isEditable isHideable />
    ),
  },
  {
    id: 'projects',
    icon: <Coffee />,
    component: <Section path="sections.projects" titleKey="name" subtitleKey="description" isEditable isHideable />,
  },
  {
    id: 'social',
    icon: <Twitter />,
    component: <Social />,
  },
  {
    id: 'contact',
    icon: <Map />,
    component: <Contact />,
  },
  {
    id: 'footer',
    icon: <Groups />,
    component: <Section path="sections.footer" titleKey="terms" subtitleKey="privacy" isEditable isHideable />,
  },
];

export const right: SidebarSection[] = [
  {
    id: 'templates',
    icon: <Category />,
    component: <Templates />,
  },
  {
    id: 'layout',
    icon: <Margin />,
    component: <Layout />,
  },
  {
    id: 'typography',
    icon: <FontDownload />,
    component: <Typography />,
  },
  {
    id: 'theme',
    icon: <Palette />,
    component: <Theme />,
  },
  {
    id: 'css',
    icon: <Style />,
    component: <CustomCSS />,
  },
  {
    id: 'sharing',
    icon: <Share />,
    component: <Sharing />,
  },
  {
    id: 'export',
    icon: <Download />,
    component: <Export />,
  },
  {
    id: 'settings',
    icon: <SettingsIcon />,
    component: <Settings />,
  },
  {
    id: 'links',
    icon: <LinkIcon />,
    component: <Links />,
  },
];

export const getCustomSections = (sections: Record<string, SectionRecord>): Array<Required<SectionRecord>> => {
  if (isEmpty(sections)) return [];

  return Object.entries(sections).reduce((acc, [id, section]) => {
    if (section.type === 'custom') {
      return [...acc, { ...section, id }];
    }

    return acc;
  }, [] as Array<Required<SectionRecord>>);
};

const sections = [...left, ...right];

export default sections;
