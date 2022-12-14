import { css } from '@emotion/css';
import { Cake, Email, Phone, Public, Room } from '@mui/icons-material';
import { ThemeConfig } from '@reactive-website/schema';
import clsx from 'clsx';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { useMemo } from 'react';

import { useAppSelector } from '@/store/hooks';
import DataDisplay from '@/templates/shared/DataDisplay';
import { formatDateString } from '@/utils/date';
import getProfileIcon from '@/utils/getProfileIcon';
import { getContrastColor } from '@/utils/styles';
import { addHttp, formatLocation, getPhotoClassNames } from '@/utils/template';

export const MastheadSidebar: React.FC = () => {
  const dateFormat: string = useAppSelector((state) => get(state.website.present, 'metadata.date.format'));
  const { name, headline, photo, email, phone, website, contact, social } = useAppSelector(
    (state) => state.website.present.general
  );
  const theme: ThemeConfig = useAppSelector((state) => get(state.website.present, 'metadata.theme', {}));
  const contrast = useMemo(() => getContrastColor(theme.primary), [theme.primary]);
  const color = useMemo(() => (contrast === 'dark' ? theme.text : theme.background), [theme, contrast]);

  return (
    <div className="col-span-2 grid justify-items-start gap-3 px-4 pt-4">
      {photo.visible && !isEmpty(photo.url) && (
        <img
          alt={name}
          src={photo.url}
          width={photo.filters.size}
          height={photo.filters.size}
          className={getPhotoClassNames(photo.filters)}
        />
      )}

      <div>
        <h1 className="mb-1">{name}</h1>
        <p className="opacity-75">{headline}</p>
      </div>

      <div className={clsx('flex flex-col gap-2.5', css(`svg { color: ${color} }`))}>
        <DataDisplay icon={<Room />} className="!gap-2 text-xs">
          {formatLocation(contact)}
        </DataDisplay>

        <DataDisplay icon={<Email />} className="!gap-2 text-xs" link={`mailto:${email}`}>
          {email}
        </DataDisplay>

        <DataDisplay icon={<Phone />} className="!gap-2 text-xs" link={`tel:${phone}`}>
          {phone}
        </DataDisplay>

        <DataDisplay icon={<Public />} link={website && addHttp(website)} className="!gap-2 text-xs">
          {website}
        </DataDisplay>

        {social.map(({ id, username, network, url }) => (
          <DataDisplay key={id} icon={getProfileIcon(network)} link={url && addHttp(url)} className="!gap-2 text-xs">
            {username}
          </DataDisplay>
        ))}
      </div>
    </div>
  );
};

export const MastheadMain: React.FC = () => {
  const { summary } = useAppSelector((state) => state.website.present.general);

  return <div className="px-4 pt-4">{summary}</div>;
};
