import { Link } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTranslation } from 'next-i18next';

import Heading from '@/components/shared/Heading';
import { DOCS_URL, GITHUB_URL } from '@/constants/index';

import styles from './Links.module.scss';

const Links = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading path="metadata.links" name={t<string>('builder.rightSidebar.sections.links.heading')} />

      <div className={styles.container}>
        <div>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            <Button variant="text" startIcon={<Link />}>
              {t<string>('builder.rightSidebar.sections.links.github')}
            </Button>
          </a>

          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            <Button variant="text" startIcon={<Link />}>
              {t<string>('builder.rightSidebar.sections.links.docs')}
            </Button>
          </a>
        </div>
      </div>
    </>
  );
};

export default Links;
