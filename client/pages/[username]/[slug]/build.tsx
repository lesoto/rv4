import { Website } from '@reactive-website/schema';
import isEmpty from 'lodash/isEmpty';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import { useQuery } from 'react-query';

import Center from '@/components/build/Center/Center';
import LeftSidebar from '@/components/build/LeftSidebar/LeftSidebar';
import RightSidebar from '@/components/build/RightSidebar/RightSidebar';
import { fetchWebsiteByIdentifier } from '@/services/website';
import { useAppDispatch } from '@/store/hooks';
import { setWebsite } from '@/store/website/websiteSlice';
import styles from '@/styles/pages/Build.module.scss';

type QueryParams = {
  username: string;
  slug: string;
};

type Props = {
  username: string;
  slug: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query, locale = 'en' }) => {
  const { username, slug } = query as QueryParams;

  return {
    props: { username, slug, ...(await serverSideTranslations(locale, ['common', 'modals', 'builder'])) },
  };
};

const Build: NextPage<Props> = ({ username, slug }) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const { data: website } = useQuery<Website>(
    `website/${username}/${slug}`,
    () => fetchWebsiteByIdentifier({ username, slug }),
    {
      cacheTime: 0,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onSuccess: (website) => {
        dispatch(setWebsite(website));
      },
    }
  );

  useEffect(() => {
    if (website) dispatch(setWebsite(website));
  }, [website, dispatch]);

  if (!website || isEmpty(website)) return null;

  return (
    <div className={styles.container}>
      <Head>
        <title>
          {website.name} | {t<string>('common.title')}
        </title>
      </Head>

      <LeftSidebar />
      <Center />
      <RightSidebar />
    </div>
  );
};

export default Build;
