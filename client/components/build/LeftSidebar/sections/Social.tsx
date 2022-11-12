import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { ListItem } from '@reactive-website/schema';
import { useTranslation } from 'next-i18next';

import Heading from '@/components/shared/Heading';
import List from '@/components/shared/List';
import { useAppDispatch } from '@/store/hooks';
import { setModalState } from '@/store/modal/modalSlice';
import { duplicateItem } from '@/store/website/websiteSlice';

const Social = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const handleAdd = () => {
    dispatch(setModalState({ modal: 'builder.sections.profile', state: { open: true } }));
  };

  const handleEdit = (item: ListItem) => {
    dispatch(setModalState({ modal: 'builder.sections.profile', state: { open: true, payload: { item } } }));
  };

  const handleDuplicate = (item: ListItem) => {
    dispatch(duplicateItem({ path: 'basics.social', value: item }));
  };

  return (
    <>
      <Heading path="sections.social" name={t<string>('builder.leftSidebar.sections.social.heading')} />

      <List
        path="basics.social"
        titleKey="username"
        subtitleKey="network"
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
      />

      <footer className="flex justify-end">
        <Button variant="outlined" startIcon={<Add />} onClick={handleAdd}>
          {t<string>('builder.common.actions.add', {
            token: t<string>('builder.leftSidebar.sections.social.heading', { count: 1 }),
          })}
        </Button>
      </footer>
    </>
  );
};

export default Social;
