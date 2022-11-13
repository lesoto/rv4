import { PhotoFilter } from '@mui/icons-material';
import { Button, Divider, Popover } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Heading from '@/components/shared/Heading';
import WebsiteInput from '@/components/shared/WebsiteInput';

import PhotoFilters from './PhotoFilters';
import PhotoUpload from './PhotoUpload';

const General = () => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Heading path="sections.general" name={t<string>('builder.leftSidebar.sections.general.heading')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid items-center gap-4 sm:col-span-2 sm:grid-cols-3">
          <div className="mx-auto">
            <PhotoUpload />
          </div>

          <div className="grid w-full gap-2 sm:col-span-2">
            <WebsiteInput label={t<string>('builder.leftSidebar.sections.general.name.label')} path="general.name" />

            <Button variant="outlined" startIcon={<PhotoFilter />} onClick={handleClick}>
              {t<string>('builder.leftSidebar.sections.general.actions.photo-filters')}
            </Button>

            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <PhotoFilters />
            </Popover>
          </div>
        </div>

        <Divider className="sm:col-span-2" />

        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.general.headline.label')}
          path="general.headline"
          className="sm:col-span-2"
        />
        <WebsiteInput
          type="textarea"
          label={t<string>('builder.common.form.summary.label')}
          path="general.summary"
          className="sm:col-span-2"
        />
      </div>
    </>
  );
};

export default General;
