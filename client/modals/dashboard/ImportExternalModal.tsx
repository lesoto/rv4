import { Code, ImportExport, TrackChanges, UploadFile } from '@mui/icons-material';
import { Button, Divider } from '@mui/material';
import { Integration, Resume } from '@reactive-resume/schema';
import { Trans, useTranslation } from 'next-i18next';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';

import BaseModal from '@/components/shared/BaseModal';
import { RESUMES_QUERY } from '@/constants/index';
import { ServerError } from '@/services/axios';
import { importFromExternal, ImportFromExternalParams } from '@/services/integrations';
import queryClient from '@/services/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setModalState } from '@/store/modal/modalSlice';

const FILE_UPLOAD_MAX_SIZE = 2000000; // 2 MB

const ImportExternalModal: React.FC = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const reactiveResumeInputRef = useRef<HTMLInputElement>(null);
  const reactiveResumeV2InputRef = useRef<HTMLInputElement>(null);

  const { open: isOpen } = useAppSelector((state) => state.modal['dashboard.import-external']);

  const { mutateAsync, isLoading } = useMutation<Resume, ServerError, ImportFromExternalParams>(importFromExternal);

  const handleClose = () => {
    dispatch(setModalState({ modal: 'dashboard.import-external', state: { open: false } }));
  };

  const handleClick = (integration: Integration) => {
    if (integration === 'reactive-resume') {
      if (reactiveResumeInputRef.current) {
        reactiveResumeInputRef.current.click();
        reactiveResumeInputRef.current.value = '';
      }
    } else if (integration === 'reactive-resume-v2') {
      if (reactiveResumeV2InputRef.current) {
        reactiveResumeV2InputRef.current.click();
        reactiveResumeV2InputRef.current.value = '';
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

      queryClient.invalidateQueries(RESUMES_QUERY);
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
          {t<string>('modals.dashboard.import-external.reactive-resume.heading')}
        </h2>

        <p className="mb-2">{t<string>('modals.dashboard.import-external.reactive-resume.body')}</p>

        <div className="flex gap-4">
          <Button
            variant="contained"
            disabled={isLoading}
            startIcon={<UploadFile />}
            onClick={() => handleClick('reactive-resume')}
          >
            {t<string>('modals.dashboard.import-external.reactive-resume.actions.upload-json')}
          </Button>

          <Button
            variant="contained"
            disabled={isLoading}
            startIcon={<UploadFile />}
            onClick={() => handleClick('reactive-resume-v2')}
          >
            {t<string>('modals.dashboard.import-external.reactive-resume.actions.upload-json-v2')}
          </Button>

          <input
            hidden
            type="file"
            ref={reactiveResumeInputRef}
            onChange={(event) => handleChange(event, 'reactive-resume')}
            accept="application/json"
          />

          <input
            hidden
            type="file"
            ref={reactiveResumeV2InputRef}
            onChange={(event) => handleChange(event, 'reactive-resume-v2')}
            accept="application/json"
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default ImportExternalModal;
