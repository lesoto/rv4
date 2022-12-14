import { ButtonBase } from '@mui/material';
import clsx from 'clsx';
import get from 'lodash/get';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import Heading from '@/components/shared/Heading';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWebsiteState } from '@/store/website/websiteSlice';
import templateMap, { TemplateMeta } from '@/templates/templateMap';

import styles from './Templates.module.scss';

const Templates = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const currentTemplate: string = useAppSelector((state) => get(state.website.present, 'metadata.template'));

  const handleChange = (template: TemplateMeta) => {
    dispatch(setWebsiteState({ path: 'metadata.template', value: template.id }));
  };

  return (
    <>
      <Heading path="metadata.templates" name={t<string>('builder.rightSidebar.sections.templates.heading')} />

      <div className={styles.container}>
        {Object.values(templateMap).map((template) => (
          <div key={template.id} className={styles.template}>
            <div className={clsx(styles.preview, { [styles.selected]: template.id === currentTemplate })}>
              <ButtonBase onClick={() => handleChange(template)}>
                <Image src={template.preview} alt={template.name} className="rounded-sm" layout="fill" priority />
              </ButtonBase>
            </div>

            <p className={styles.label}>{template.name}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Templates;
