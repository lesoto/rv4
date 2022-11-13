import { Avatar, IconButton, Skeleton, Tooltip } from '@mui/material';
import { Photo, Website } from '@reactive-website/schema';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import React, { useRef } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';

import { ServerError } from '@/services/axios';
import { deletePhoto, DeletePhotoParams, uploadPhoto, UploadPhotoParams } from '@/services/website';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWebsiteState } from '@/store/website/websiteSlice';

const FILE_UPLOAD_MAX_SIZE = 2000000; // 2 MB

const PhotoUpload: React.FC = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const id: number = useAppSelector((state) => get(state.website.present, 'id'));
  const photo: Photo = useAppSelector((state) => get(state.website.present, 'general.photo'));

  const { mutateAsync: uploadMutation, isLoading } = useMutation<Website, ServerError, UploadPhotoParams>(uploadPhoto);

  const { mutateAsync: deleteMutation } = useMutation<Website, ServerError, DeletePhotoParams>(deletePhoto);

  const handleClick = async () => {
    if (fileInputRef.current) {
      if (!isEmpty(photo.url)) {
        try {
          await deleteMutation({ id });
        } finally {
          dispatch(setWebsiteState({ path: 'general.photo.url', value: '' }));
        }
      } else {
        fileInputRef.current.click();
      }

      fileInputRef.current.value = '';
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (file.size > FILE_UPLOAD_MAX_SIZE) {
        toast.error(t<string>('common.toast.error.upload-photo-size'));
        return;
      }

      const website = await uploadMutation({ id, file });

      dispatch(setWebsiteState({ path: 'general.photo.url', value: get(website, 'general.photo.url', '') }));
    }
  };

  return (
    <IconButton onClick={handleClick}>
      {isLoading ? (
        <Skeleton variant="circular" width={96} height={96} />
      ) : (
        <Tooltip
          title={
            isEmpty(photo.url)
              ? (t<string>('builder.leftSidebar.sections.general.photo-upload.tooltip.upload') as string)
              : (t<string>('builder.leftSidebar.sections.general.photo-upload.tooltip.remove') as string)
          }
        >
          <Avatar sx={{ width: 96, height: 96 }} src={photo.url} />
        </Tooltip>
      )}

      <input hidden type="file" ref={fileInputRef} onChange={handleChange} accept="image/*" />
    </IconButton>
  );
};

export default PhotoUpload;
