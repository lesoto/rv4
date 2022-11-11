import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const DateWrapper: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { locale } = useRouter();

  useEffect(() => {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(relativeTime);

    // Set Default Timezone to UTC
    dayjs.tz.setDefault('UTC');

    // Locales
    require('dayjs/locale/en');
    require('dayjs/locale/ru');

    if (locale) {
      if (locale === 'no') dayjs.locale('nb');
      else dayjs.locale(locale);
    }
  }, [locale]);

  return <>{children}</>;
};

export default DateWrapper;
