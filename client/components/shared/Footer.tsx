import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

type Props = {
  className?: string;
};

const Footer: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx('text-xs', className)}>
      <p>{t<string>('common.footer.license')}</p>
    </div>
  );
};

export default Footer;
