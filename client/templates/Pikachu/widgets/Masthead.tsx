import { Cake, Email, Phone, Public, Room } from '@mui/icons-material';
import { ThemeConfig } from '@reactive-website/schema';
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
  const { name, photo, email, phone, website, contact, social } = useAppSelector(
    (state) => state.website.present.basics
  );

  return (
    <div className="col-span-2 grid justify-items-start gap-4">
      {photo.visible && !isEmpty(photo.url) && (
        <img
          alt={name}
          src={photo.url}
          width={photo.filters.size}
          height={photo.filters.size}
          className={getPhotoClassNames(photo.filters)}
        />
      )}

      <div className="flex flex-col gap-2">
        <DataDisplay icon={<Room />} className="text-xs">
          {formatLocation(contact)}
        </DataDisplay>

        <DataDisplay icon={<Email />} className="text-xs" link={`mailto:${email}`}>
          {email}
        </DataDisplay>

        <DataDisplay icon={<Phone />} className="text-xs" link={`tel:${phone}`}>
          {phone}
        </DataDisplay>

        <DataDisplay icon={<Public />} link={addHttp(website)} className="text-xs">
          {website}
        </DataDisplay>

        {social.map(({ id, username, network, url }) => (
          <DataDisplay key={id} icon={getProfileIcon(network)} link={url && addHttp(url)} className="text-xs">
            {username}
          </DataDisplay>
        ))}
      </div>
    </div>
  );
};

export const MastheadMain: React.FC = () => {
  const theme: ThemeConfig = useAppSelector((state) => get(state.website.present, 'metadata.theme', {}));
  const contrast = useMemo(() => getContrastColor(theme.primary), [theme.primary]);

  const { name, summary, headline } = useAppSelector((state) => state.website.present.basics);

  return (
    <div
      className="grid gap-2 p-4"
      style={{ color: contrast === 'dark' ? theme.text : theme.background, backgroundColor: theme.primary }}
    >
      <div>
        <h1>{name}</h1>
        <p className="opacity-75">{headline}</p>
      </div>

      <hr className="opacity-25" />

      <p>{summary}</p>
    </div>
  );
};
