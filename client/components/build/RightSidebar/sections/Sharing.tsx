import { CopyAll } from '@mui/icons-material';
import { Checkbox, FormControlLabel, IconButton, List, ListItem, ListItemText, Switch, TextField } from '@mui/material';
import get from 'lodash/get';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import Heading from '@/components/shared/Heading';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWebsiteState } from '@/store/website/websiteSlice';
import getWebsiteUrl from '@/utils/getWebsiteUrl';

const Sharing = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [showShortUrl, setShowShortUrl] = useState(false);

  const website = useAppSelector((state) => state.website.present);
  const isPublic = useMemo(() => get(website, 'public'), [website]);
  const url = useMemo(() => getWebsiteUrl(website, { withHost: true }), [website]);
  const shortUrl = useMemo(() => getWebsiteUrl(website, { withHost: true, shortUrl: true }), [website]);

  const handleSetVisibility = (value: boolean) => dispatch(setWebsiteState({ path: 'public', value }));

  const handleCopyToClipboard = async () => {
    const text = showShortUrl ? shortUrl : url;

    await navigator.clipboard.writeText(text);

    toast.success(t<string>('common.toast.success.website-link-copied'));
  };

  return (
    <>
      <Heading path="metadata.sharing" name={t<string>('builder.rightSidebar.sections.sharing.heading')} />

      <List sx={{ padding: 0 }}>
        <ListItem className="flex flex-col" sx={{ padding: 0 }}>
          <div className="flex w-full items-center justify-between">
            <ListItemText
              primary={t<string>('builder.rightSidebar.sections.sharing.visibility.title')}
              secondary={t<string>('builder.rightSidebar.sections.sharing.visibility.subtitle')}
            />
            <Switch color="secondary" checked={isPublic} onChange={(_, value) => handleSetVisibility(value)} />
          </div>

          <div className="mt-2 w-full">
            <TextField
              disabled
              fullWidth
              value={showShortUrl ? shortUrl : url}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleCopyToClipboard}>
                    <CopyAll />
                  </IconButton>
                ),
              }}
            />
          </div>

          <div className="mt-1 flex w-full">
            <FormControlLabel
              label={t<string>('builder.rightSidebar.sections.sharing.short-url.label')}
              control={
                <Checkbox className="mr-1" checked={showShortUrl} onChange={(_, value) => setShowShortUrl(value)} />
              }
            />
          </div>
        </ListItem>
      </List>
    </>
  );
};

export default Sharing;
