import { Website } from '@reactive-website/schema';
import clsx from 'clsx';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';

import Page from '@/components/build/Center/Page';
import { fetchWebsiteByIdentifier } from '@/services/website';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWebsite } from '@/store/website/websiteSlice';
import styles from '@/styles/pages/Printer.module.scss';

type QueryParams = {
  slug: string;
  username: string;
  secretKey?: string;
};

type Props = {
  website?: Website;
  locale: string;
  redirect?: any;
};

export const getServerSideProps: GetServerSideProps<Props | Promise<Props>, QueryParams> = async ({
  query,
  locale,
}) => {
  const { username, slug, secretKey } = query as QueryParams;

  try {
    if (isEmpty(secretKey)) throw new Error('There is no secret key!');

    const website = await fetchWebsiteByIdentifier({ username, slug, options: { secretKey } });
    const displayLocale = website.metadata.locale || locale || 'en';

    return {
      props: {
        website,
        locale: displayLocale,
        ...(await serverSideTranslations(displayLocale, ['common'])),
      },
    };
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
};

const Printer: NextPage<Props> = ({ website: initialData, locale }) => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const website = useAppSelector((state) => state.website.present);

  useEffect(() => {
    if (router.locale !== locale) {
      const { pathname, asPath, query } = router;

      router.push({ pathname, query }, asPath, { locale });
    }
  }, [router, locale]);

  useEffect(() => {
    if (initialData) dispatch(setWebsite(initialData));
  }, [dispatch, initialData]);

  if (!website || isEmpty(website)) return null;

  const layout: string[][][] = get(website, 'metadata.layout', []);

  return (
    <div className={clsx('printer-mode', styles.container)}>
      {layout.map((_, pageIndex) => (
        <Page key={pageIndex} page={pageIndex} />
      ))}
    </div>
  );
};

export default Printer;
