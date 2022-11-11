import { joiResolver } from '@hookform/resolvers/joi';
import { DriveFileRenameOutline } from '@mui/icons-material';
import { Button, TextField } from '@mui/material';
import { Website } from '@reactive-website/schema';
import Joi from 'joi';
import get from 'lodash/get';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import BaseModal from '@/components/shared/BaseModal';
import { WEBSITE_QUERY } from '@/constants/index';
import { ServerError } from '@/services/axios';
import queryClient from '@/services/react-query';
import { renameWebsite, RenameWebsiteParams } from '@/services/website';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ModalState, setModalState } from '@/store/modal/modalSlice';

type FormData = {
  name: string;
  slug: string;
};

const schema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string()
    .lowercase()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'only lowercase characters, numbers and hyphens')
    .required(),
});

const RenameWebsiteModal: React.FC = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const { open: isOpen, payload } = useAppSelector((state) => state.modal['dashboard.rename-website']) as ModalState;
  const website: Website = get(payload, 'item') as Website;
  const onComplete = get(payload, 'onComplete', noop);

  const { mutateAsync, isLoading } = useMutation<Website, ServerError, RenameWebsiteParams>(renameWebsite);

  const { reset, watch, control, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: website?.name,
      slug: website?.slug,
    },
    resolver: joiResolver(schema),
  });
  const name = watch('name');

  useEffect(() => {
    const slug = name
      ? name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/[ ]/gi, '-')
      : '';

    setValue('slug', slug);
  }, [name, setValue]);

  useEffect(() => {
    if (!website) return;

    const { name, slug }: FormData = website;

    reset({ name, slug });
  }, [website, reset]);

  const onSubmit = async ({ name, slug }: FormData) => {
    if (!website) return;

    const newWebsite = await mutateAsync({ id: website.id, name, slug });

    onComplete && onComplete(newWebsite);

    queryClient.invalidateQueries(WEBSITE_QUERY);

    handleClose();
  };

  const handleClose = () => {
    dispatch(setModalState({ modal: 'dashboard.rename-website', state: { open: false } }));
    reset();
  };

  return (
    <BaseModal
      icon={<DriveFileRenameOutline />}
      isOpen={isOpen}
      heading={t<string>('modals.dashboard.rename-website.heading')}
      handleClose={handleClose}
      footerChildren={
        <Button type="submit" disabled={isLoading} onClick={handleSubmit(onSubmit)}>
          {t<string>('modals.dashboard.rename-website.actions.rename-website')}
        </Button>
      }
    >
      <form className="grid gap-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              autoFocus
              label={t<string>('modals.dashboard.rename-website.form.name.label')}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="slug"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label={t<string>('modals.dashboard.rename-website.form.slug.label')}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              {...field}
            />
          )}
        />
      </form>
    </BaseModal>
  );
};

export default RenameWebsiteModal;
