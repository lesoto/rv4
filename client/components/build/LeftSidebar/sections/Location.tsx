import { useTranslation } from 'next-i18next';

import Heading from '@/components/shared/Heading';
import WebsiteInput from '@/components/shared/WebsiteInput';

const Location = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading path="sections.location" name={t<string>('builder.leftSidebar.sections.location.heading')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.location.address.label')}
          path="basics.location.address"
          className="sm:col-span-2"
        />
        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.location.city.label')}
          path="basics.location.city"
        />
        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.location.region.label')}
          path="basics.location.region"
        />
        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.location.country.label')}
          path="basics.location.country"
        />
        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.location.postal-code.label')}
          path="basics.location.postalCode"
        />
      </div>
    </>
  );
};

export default Location;
