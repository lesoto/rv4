import { Website } from '@reactive-website/schema';
import { AxiosResponse } from 'axios';

import isBrowser from '@/utils/isBrowser';

import axios from './axios';

export type CreateWebsiteParams = {
  name: string;
  slug: string;
  public: boolean;
};

export type FetchWebsiteByIdentifierParams = {
  username: string;
  slug: string;
  options?: {
    secretKey?: string;
  };
};

export type FetchWebsiteByShortIdParams = {
  shortId: string;
};

export type RenameWebsiteParams = {
  id: number;
  name: string;
  slug: string;
};

export type DuplicateWebsiteParams = {
  id: number;
};

export type LoadSampleDataParams = {
  id: number;
};

export type ResetWebsiteParams = {
  id: number;
};

export type UploadPhotoParams = {
  id: number;
  file: File;
};

export type DeletePhotoParams = {
  id: number;
};

export type DeleteWebsiteParams = {
  id: number;
};

export const fetchWebsites = () => axios.get<Website[]>('/website').then((res) => res.data);

export const fetchWebsiteByIdentifier = async ({
  username,
  slug,
  options = { secretKey: '' },
}: FetchWebsiteByIdentifierParams) => {
  if (!isBrowser) {
    const secretKey = options.secretKey;

    return axios.get<Website>(`/website/${username}/${slug}`, { params: { secretKey } }).then((res) => res.data);
  }

  return axios.get<Website>(`/website/${username}/${slug}`).then((res) => res.data);
};

export const fetchWebsiteByShortId = async ({ shortId }: FetchWebsiteByShortIdParams) =>
  axios.get<Website>(`/website/short/${shortId}`).then((res) => res.data);

export const createWebsite = (createWebsiteParams: CreateWebsiteParams) =>
  axios
    .post<Website, AxiosResponse<Website>, CreateWebsiteParams>('/website', createWebsiteParams)
    .then((res) => res.data);

export const renameWebsite = (renameWebsiteParams: RenameWebsiteParams) =>
  axios
    .patch<Website, AxiosResponse<Website>, RenameWebsiteParams>(
      `/website/${renameWebsiteParams.id}`,
      renameWebsiteParams
    )
    .then((res) => res.data);

export const updateWebsite = (updateWebsiteParams: Partial<Website>) =>
  axios
    .patch<Website, AxiosResponse<Website>, Partial<Website>>(`/website/${updateWebsiteParams.id}`, updateWebsiteParams)
    .then((res) => res.data);

export const duplicateWebsite = (duplicateWebsiteParams: DuplicateWebsiteParams) =>
  axios
    .post<Website, AxiosResponse<Website>, DuplicateWebsiteParams>(`/website/${duplicateWebsiteParams.id}/duplicate`)
    .then((res) => res.data);

export const loadSampleData = (loadSampleDataParams: LoadSampleDataParams) =>
  axios
    .post<Website, AxiosResponse<Website>, LoadSampleDataParams>(`/website/${loadSampleDataParams.id}/sample`)
    .then((res) => res.data);

export const resetWebsite = (resetWebsiteParams: ResetWebsiteParams) =>
  axios
    .post<Website, AxiosResponse<Website>, ResetWebsiteParams>(`/website/${resetWebsiteParams.id}/reset`)
    .then((res) => res.data);

export const uploadPhoto = async (uploadPhotoParams: UploadPhotoParams) => {
  const formData = new FormData();

  formData.append('file', uploadPhotoParams.file);

  return axios
    .put<Website, AxiosResponse<Website>, FormData>(`/website/${uploadPhotoParams.id}/photo`, formData)
    .then((res) => res.data);
};

export const deletePhoto = async (deletePhotoParams: DeletePhotoParams) =>
  axios.delete<Website, AxiosResponse<Website>>(`/website/${deletePhotoParams.id}/photo`).then((res) => res.data);

export const deleteWebsite = (deleteWebsiteParams: DeleteWebsiteParams) =>
  axios
    .delete<void, AxiosResponse<void>, DeleteWebsiteParams>(`/website/${deleteWebsiteParams.id}`)
    .then((res) => res.data);
