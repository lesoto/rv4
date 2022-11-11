import { Download, Downloading } from '@mui/icons-material';
import { ButtonBase } from '@mui/material';
import { Website } from '@reactive-website/schema';
import clsx from 'clsx';
import download from 'downloadjs';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from 'react-query';

import Page from '@/components/build/Center/Page';
import { ServerError } from '@/services/axios';
import { printWebsiteAsPdf, PrintWebsiteAsPdfParams } from '@/services/printer';
import { fetchWebsiteByIdentifier } from '@/services/website';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWebsite } from '@/store/website/websiteSlice';
import styles from '@/styles/pages/Preview.module.scss';

type QueryParams = {
  slug: string;
  username: string;
};

type Props = {
  slug: string;
  website?: Website;
  username: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query, locale = 'en' }) => {
  const { username, slug } = query as QueryParams;

  try {
    const website = await fetchWebsiteByIdentifier({ username, slug });

    return {
      props: { username, slug, website, ...(await serverSideTranslations(locale, ['common'])) },
    };
  } catch {
    return { props: { username, slug, ...(await serverSideTranslations(locale, ['common'])) } };
  }
};

const Preview: NextPage<Props> = ({ username, slug, website: initialData }) => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const website = useAppSelector((state) => state.website.present);

  useEffect(() => {
    if (initialData && !isEmpty(initialData)) {
      dispatch(setWebsite(initialData));
    }
  }, [dispatch, initialData]);

  useEffect(() => {
    if (!isEmpty(website) && router.locale !== website.metadata.locale) {
      const { pathname, asPath, query } = router;

      router.push({ pathname, query }, asPath, { locale: website.metadata.locale });
    }
  }, [website, router]);

  useQuery<Website>(`website/${username}/${slug}`, () => fetchWebsiteByIdentifier({ username, slug }), {
    initialData,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      dispatch(setWebsite(data));
    },
    onError: (error) => {
      const errorObj = JSON.parse(JSON.stringify(error));
      const statusCode: number = get(errorObj, 'status', 404);

      if (statusCode === 404) {
        toast.error('The website you were looking for does not exist, or maybe it never did?');

        router.push('/');
      }
    },
  });

  const { mutateAsync, isLoading } = useMutation<string, ServerError, PrintWebsiteAsPdfParams>(printWebsiteAsPdf);

  if (isEmpty(website)) return null;

  const layout: string[][][] = get(website, 'metadata.layout', []);

  const handleDownload = async () => {
    try {
      const url = await mutateAsync({ username, slug });

      download(url);
    } catch {
      toast.error('Something went wrong, please try again later.');
    }
  };

  return (
    <div className={clsx('preview-mode', styles.container)}>
      {layout.map((_, pageIndex) => (
        <Page key={pageIndex} page={pageIndex} />
      ))}

      <div className={clsx(styles.download, { 'opacity-75': isLoading })}>
        <ButtonBase onClick={handleDownload} disabled={isLoading}>
          {isLoading ? (
            <>
              <Downloading />
              <h4>Please wait</h4>
            </>
          ) : (
            <>
              <Download />
              <h4>Download PDF</h4>
            </>
          )}
        </ButtonBase>
      </div>

      <p className={styles.footer}>
        Made with <Link href="/">Reactive Website</Link>
      </p>
    </div>
  );
};

export default Preview;
