import { Code, ImportExport, TrackChanges, UploadFile } from '@mui/icons-material';
import { Button, Divider } from '@mui/material';
import { Integration, Website } from '@reactive-website/schema';
import { Trans, useTranslation } from 'next-i18next';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';

import BaseModal from '@/components/shared/BaseModal';
import { WEBSITE_QUERY } from '@/constants/index';
import { ServerError } from '@/services/axios';
import { importFromExternal, ImportFromExternalParams } from '@/services/integrations';
import queryClient from '@/services/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setModalState } from '@/store/modal/modalSlice';

const FILE_UPLOAD_MAX_SIZE = 2000000; // 2 MB

const ImportExternalModal: React.FC = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const reactiveWebsiteInputRef = useRef<HTMLInputElement>(null);
  const reactiveWebsiteV2InputRef = useRef<HTMLInputElement>(null);

  const { open: isOpen } = useAppSelector((state) => state.modal['dashboard.import-external']);

  const { mutateAsync, isLoading } = useMutation<Website, ServerError, ImportFromExternalParams>(importFromExternal);

  const handleClose = () => {
    dispatch(setModalState({ modal: 'dashboard.import-external', state: { open: false } }));
  };

  const handleClick = (integration: Integration) => {
    if (integration === 'reactive-website') {
      if (reactiveWebsiteInputRef.current) {
        reactiveWebsiteInputRef.current.click();
        reactiveWebsiteInputRef.current.value = '';
      }
    } else if (integration === 'reactive-website-v2') {
      if (reactiveWebsiteV2InputRef.current) {
        reactiveWebsiteV2InputRef.current.click();
        reactiveWebsiteV2InputRef.current.value = '';
      }
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>, integration: Integration) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (file.size > FILE_UPLOAD_MAX_SIZE) {
        toast.error(t<string>('common.toast.error.upload-file-size'));
        return;
      }

      await mutateAsync({ integration, file });

      queryClient.invalidateQueries(WEBSITE_QUERY);
      handleClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      icon={<ImportExport />}
      heading={t<string>('modals.dashboard.import-external.heading')}
      handleClose={handleClose}
    >
      <Divider className="py-2" />

      <div className="grid gap-5">
        <h2 className="inline-flex items-center gap-2 text-lg font-medium">
          <TrackChanges />
          {t<string>('modals.dashboard.import-external.reactive-website.heading')}
        </h2>

        <p className="mb-2">{t<string>('modals.dashboard.import-external.reactive-website.body')}</p>

        <div className="flex gap-4">
          <Button
            variant="contained"
            disabled={isLoading}
            startIcon={<UploadFile />}
            onClick={() => handleClick('reactive-website')}
          >
            {t<string>('modals.dashboard.import-external.reactive-website.actions.upload-json')}
          </Button>

          <Button
            variant="contained"
            disabled={isLoading}
            startIcon={<UploadFile />}
            onClick={() => handleClick('reactive-website-v2')}
          >
            {t<string>('modals.dashboard.import-external.reactive-website.actions.upload-json-v2')}
          </Button>

          <input
            hidden
            type="file"
            ref={reactiveWebsiteInputRef}
            onChange={(event) => handleChange(event, 'reactive-website')}
            accept="application/json"
          />

          <input
            hidden
            type="file"
            ref={reactiveWebsiteV2InputRef}
            onChange={(event) => handleChange(event, 'reactive-website-v2')}
            accept="application/json"
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default ImportExternalModal;
