import { ThemeConfig } from '@reactive-website/schema';
import get from 'lodash/get';
import { useTranslation } from 'next-i18next';

import ColorAvatar from '@/components/shared/ColorAvatar';
import ColorPicker from '@/components/shared/ColorPicker';
import Heading from '@/components/shared/Heading';
import { colorOptions } from '@/config/colors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWebsiteState } from '@/store/website/websiteSlice';

import styles from './Theme.module.scss';

const Theme = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const { background, text, primary } = useAppSelector<ThemeConfig>((state) =>
    get(state.website.present, 'metadata.theme')
  );

  const handleChange = (property: string, color: string) => {
    dispatch(setWebsiteState({ path: `metadata.theme.${property}`, value: color[0] !== '#' ? `#${color}` : color }));
  };

  return (
    <>
      <Heading path="metadata.theme" name={t<string>('builder.rightSidebar.sections.theme.heading')} />

      <div className={styles.container}>
        <div className={styles.colorOptions}>
          {colorOptions.map((color) => (
            <ColorAvatar key={color} color={color} onClick={(color) => handleChange('primary', color)} />
          ))}
        </div>

        <ColorPicker
          label={t<string>('builder.rightSidebar.sections.theme.form.primary.label')}
          color={primary}
          className="col-span-2"
          onChange={(color) => handleChange('primary', color)}
        />
        <ColorPicker
          label={t<string>('builder.rightSidebar.sections.theme.form.background.label')}
          color={background}
          onChange={(color) => handleChange('background', color)}
        />
        <ColorPicker
          label={t<string>('builder.rightSidebar.sections.theme.form.text.label')}
          color={text}
          onChange={(color) => handleChange('text', color)}
        />
      </div>
    </>
  );
};

export default Theme;
