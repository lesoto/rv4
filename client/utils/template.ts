import { ListItem, Contact, PhotoFilters } from '@reactive-website/schema';
import clsx from 'clsx';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';

export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type PageProps = {
  page: number;
};

export const formatLocation = (contact?: Contact): string => {
  if (!contact) return '';

  const contactArr = [contact.address, contact.city, contact.state, contact.zipCode, contact.country];
  const filteredLocationArr = contactArr.filter((x) => !isEmpty(x));

  return filteredLocationArr.join(', ');
};

export const addHttp = (url: string) => {
  if (url.search(/^http[s]?:\/\//) == -1) {
    url = 'http://' + url;
  }

  return url;
};

export const isValidUrl = (string: string): boolean => {
  let url: URL;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

type Separator = ', ' | ' / ' | ' | ';

export const parseListItemPath = (item: ListItem, path: string | string[], separator: Separator = ', '): string => {
  if (isArray(path)) {
    const value = path.map((_path) => get(item, _path)).filter((x) => x);

    return value.join(separator);
  } else {
    const value = get(item, path);

    return value;
  }
};

export const getPhotoClassNames = (filters: PhotoFilters) =>
  clsx({
    'object-cover': true,
    grayscale: filters.grayscale,
    '!border-[4px] !border-solid': filters.border,
    'rounded-lg': filters.shape === 'rounded-square',
    'rounded-full': filters.shape === 'circle',
  });
