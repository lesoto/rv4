import { useTranslation } from 'next-i18next';

import Heading from '@/components/shared/Heading';
import WebsiteInput from '@/components/shared/WebsiteInput';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading path="sections.contact" name={t<string>('builder.leftSidebar.sections.contact.heading')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <WebsiteInput
          label={t<string>('builder.common.form.email.label')}
          path="basics.email"
          className="sm:col-span-2"
        />
        <WebsiteInput label={t<string>('builder.common.form.url.label')} path="basics.website" />
        <WebsiteInput label={t<string>('builder.common.form.phone.label')} path="basics.phone" />

        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.contact.address.label')}
          path="basics.contact.address"
          className="sm:col-span-2"
        />
        <WebsiteInput label={t<string>('builder.leftSidebar.sections.contact.city.label')} path="basics.contact.city" />
        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.contact.state.label')}
          path="basics.contact.state"
        />
        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.contact.zip-code.label')}
          path="basics.contact.zipCode"
        />
        <WebsiteInput
          label={t<string>('builder.leftSidebar.sections.contact.country.label')}
          path="basics.contact.country"
        />
      </div>
    </>
  );
};

export default Contact;
