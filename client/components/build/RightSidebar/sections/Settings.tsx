import { Anchor, DeleteForever, Palette } from '@mui/icons-material';
import {
  Autocomplete,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Switch,
  TextField,
} from '@mui/material';
import { DateConfig, PageConfig, Website } from '@reactive-website/schema';
import dayjs from 'dayjs';
import get from 'lodash/get';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { useMutation } from 'react-query';

import Heading from '@/components/shared/Heading';
import ThemeSwitch from '@/components/shared/ThemeSwitch';
import { Language, languageMap, languages } from '@/config/languages';
import { ServerError } from '@/services/axios';
import queryClient from '@/services/react-query';
import { loadSampleData, LoadSampleDataParams, resetWebsite, ResetWebsiteParams } from '@/services/website';
import { setTheme, togglePageBreakLine, togglePageOrientation } from '@/store/build/buildSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWebsiteState } from '@/store/website/websiteSlice';
import { dateFormatOptions } from '@/utils/date';

const Settings = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const { locale, ...router } = useRouter();

  const [confirmReset, setConfirmReset] = useState(false);

  const website = useAppSelector((state) => state.website.present);
  const theme = useAppSelector((state) => state.build.theme);
  const pages = useAppSelector((state) => state.website.present.metadata.layout);
  const breakLine = useAppSelector((state) => state.build.page.breakLine);
  const orientation = useAppSelector((state) => state.build.page.orientation);

  const id: number = useMemo(() => get(website, 'id'), [website]);
  const slug: string = useMemo(() => get(website, 'slug'), [website]);
  const username: string = useMemo(() => get(website, 'user.username'), [website]);
  const pageConfig: PageConfig = useMemo(() => get(website, 'metadata.page'), [website]);
  const dateConfig: DateConfig = useMemo(() => get(website, 'metadata.date'), [website]);

  const isDarkMode = useMemo(() => theme === 'dark', [theme]);
  const exampleDateString = useMemo(() => `Eg. ${dayjs().utc().format(dateConfig.format)}`, [dateConfig.format]);
  const themeString = useMemo(() => (isDarkMode ? 'Matte Black Everything' : 'As bright as your future'), [isDarkMode]);

  const { mutateAsync: loadSampleDataMutation } = useMutation<Website, ServerError, LoadSampleDataParams>(
    loadSampleData
  );
  const { mutateAsync: resetWebsiteMutation } = useMutation<Website, ServerError, ResetWebsiteParams>(resetWebsite);

  const handleSetTheme = (value: boolean) => dispatch(setTheme({ theme: value ? 'dark' : 'light' }));

  const handleChangePageFormat = (value: PageConfig['format'] | null) =>
    dispatch(setWebsiteState({ path: 'metadata.page.format', value }));

  const handleChangeDateFormat = (value: string | null) =>
    dispatch(setWebsiteState({ path: 'metadata.date.format', value }));

  const handleChangeLanguage = (value: Language | null) => {
    const { pathname, asPath, query, push } = router;
    const code = value?.code || 'en';

    document.cookie = `NEXT_LOCALE=${code}; path=/; expires=2147483647`;
    dispatch(setWebsiteState({ path: 'metadata.locale', value: code }));

    push({ pathname, query }, asPath, { locale: code });
  };

  const handleLoadSampleData = async () => {
    await loadSampleDataMutation({ id });

    queryClient.invalidateQueries(`website/${username}/${slug}`);
  };

  const handleResetWebsite = async () => {
    if (!confirmReset) {
      return setConfirmReset(true);
    }

    await resetWebsiteMutation({ id });
    await queryClient.invalidateQueries(`website/${username}/${slug}`);

    setConfirmReset(false);
  };

  return (
    <>
      <Heading path="metadata.settings" name={t<string>('builder.rightSidebar.sections.settings.heading')} />

      <List sx={{ padding: 0 }}>
        {/* Global Settings */}
        <>
          <ListSubheader disableSticky className="rounded">
            {t<string>('builder.rightSidebar.sections.settings.global.heading')}
          </ListSubheader>

          <ListItem>
            <ListItemIcon>
              <Palette />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('builder.rightSidebar.sections.settings.global.theme.primary')}
              secondary={themeString}
            />
            <ThemeSwitch checked={isDarkMode} onChange={(_, value: boolean) => handleSetTheme(value)} />
          </ListItem>

          <ListItem className="flex-col">
            <ListItemText
              className="w-full"
              primary={t<string>('builder.rightSidebar.sections.settings.global.date.primary')}
              secondary={t<string>('builder.rightSidebar.sections.settings.global.date.secondary')}
            />
            <Autocomplete<string, false, true, false>
              disableClearable
              className="my-2 w-full"
              options={dateFormatOptions}
              value={dateConfig.format}
              onChange={(_, value) => handleChangeDateFormat(value)}
              renderInput={(params) => <TextField {...params} helperText={exampleDateString} />}
            />
          </ListItem>

          <ListItem className="flex-col">
            <ListItemText
              className="w-full"
              primary={t<string>('builder.rightSidebar.sections.settings.global.language.primary')}
              secondary={t<string>('builder.rightSidebar.sections.settings.global.language.secondary')}
            />
            <Autocomplete<Language, false, true, false>
              disableClearable
              className="my-2 w-full"
              options={languages}
              value={languageMap[locale ?? 'en']}
              isOptionEqualToValue={(a, b) => a.code === b.code}
              onChange={(_, value) => handleChangeLanguage(value)}
              renderInput={(params) => <TextField {...params} />}
              getOptionLabel={(language) => {
                if (language.localName) {
                  return `${language.name} (${language.localName})`;
                }

                return language.name;
              }}
            />
          </ListItem>
        </>

        {/* Page Settings */}
        <>
          <ListSubheader disableSticky className="rounded">
            {t<string>('builder.rightSidebar.sections.settings.page.heading')}
          </ListSubheader>

          <ListItem className="flex-col">
            <ListItemText
              className="w-full"
              primary={t<string>('builder.rightSidebar.sections.settings.page.format.primary')}
              secondary={t<string>('builder.rightSidebar.sections.settings.page.format.secondary')}
            />
            <Autocomplete<PageConfig['format'], false, true, false>
              disableClearable
              defaultValue="A4"
              className="my-2 w-full"
              options={['A4', 'Letter']}
              value={pageConfig?.format || 'A4'}
              renderInput={(params) => <TextField {...params} />}
              onChange={(_, value) => handleChangePageFormat(value)}
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary={t<string>('builder.rightSidebar.sections.settings.page.orientation.primary')}
              secondary={
                pages.length === 1
                  ? t<string>('builder.rightSidebar.sections.settings.page.orientation.disabled')
                  : t<string>('builder.rightSidebar.sections.settings.page.orientation.secondary')
              }
            />
            <Switch
              color="secondary"
              disabled={pages.length === 1}
              checked={orientation === 'horizontal'}
              onChange={() => dispatch(togglePageOrientation())}
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary={t<string>('builder.rightSidebar.sections.settings.page.break-line.primary')}
              secondary={t<string>('builder.rightSidebar.sections.settings.page.break-line.secondary')}
            />
            <Switch color="secondary" checked={breakLine} onChange={() => dispatch(togglePageBreakLine())} />
          </ListItem>
        </>

        {/* Website Settings */}
        <>
          <ListSubheader disableSticky className="rounded">
            {t<string>('builder.rightSidebar.sections.settings.website.heading')}
          </ListSubheader>

          <ListItem>
            <ListItemButton onClick={handleLoadSampleData}>
              <ListItemIcon>
                <Anchor />
              </ListItemIcon>
              <ListItemText
                primary={t<string>('builder.rightSidebar.sections.settings.website.sample.primary')}
                secondary={t<string>('builder.rightSidebar.sections.settings.website.sample.secondary')}
              />
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={handleResetWebsite}>
              <ListItemIcon>
                <DeleteForever />
              </ListItemIcon>
              <ListItemText
                primary={
                  confirmReset
                    ? 'Are you sure?'
                    : t<string>('builder.rightSidebar.sections.settings.website.reset.primary')
                }
                secondary={t<string>('builder.rightSidebar.sections.settings.website.reset.secondary')}
              />
            </ListItemButton>
          </ListItem>
        </>
      </List>
    </>
  );
};

export default Settings;
