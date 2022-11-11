import { Add, ImportExport } from '@mui/icons-material';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { ActionCreators } from 'redux-undo';

import WebsiteCard from '@/components/dashboard/WebsiteCard';
import WebsitePreview from '@/components/dashboard/WebsitePreview';
import Avatar from '@/components/shared/Avatar';
import Logo from '@/components/shared/Logo';
import { WEBSITE_QUERY } from '@/constants/index';
import { fetchWebsites } from '@/services/website';
import { useAppDispatch } from '@/store/hooks';
import styles from '@/styles/pages/Dashboard.module.scss';

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'modals', 'dashboard'])),
    },
  };
};

const Dashboard: NextPage = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const { data } = useQuery(WEBSITE_QUERY, fetchWebsites);

  useEffect(() => {
    dispatch(ActionCreators.clearHistory());
  }, []);

  if (!data) return null;

  return (
    <div className={styles.container}>
      <Head>
        <title>
          {t<string>('dashboard.title')} | {t<string>('common.title')}
        </title>
      </Head>

      <header>
        <Link href="/">
          <a>
            <Logo size={40} />
          </a>
        </Link>

        <Avatar size={40} />
      </header>

      <main className={styles.websites}>
        <WebsiteCard
          modal="dashboard.create-website"
          icon={Add}
          title={t<string>('dashboard.create-website.title')}
          subtitle={t<string>('dashboard.create-website.subtitle')}
        />

        <WebsiteCard
          modal="dashboard.import-external"
          icon={ImportExport}
          title={t<string>('dashboard.import-external.title')}
          subtitle={t<string>('dashboard.import-external.subtitle')}
        />

        {data.map((website) => (
          <WebsitePreview key={website.id} website={website} />
        ))}
      </main>
    </div>
  );
};

export default Dashboard;
