import env from '@beam-australia/react-env';
import { Website } from '@reactive-website/schema';
import get from 'lodash/get';

type Options = {
  withHost?: boolean;
  shortUrl?: boolean;
  buildUrl?: boolean;
};

const defaultOptions: Options = {
  withHost: false,
  shortUrl: false,
  buildUrl: false,
};

const getWebsiteUrl = (website: Website, options: Options = defaultOptions): string => {
  const username: string = get(website, 'user.username');
  const shortId: string = get(website, 'shortId');
  const slug: string = get(website, 'slug');

  let url = '';
  let hostname = env('URL');

  if (typeof window !== 'undefined') {
    hostname = window.location.origin;
  }

  url = options.withHost ? `${hostname}` : url;
  url = options.shortUrl ? `${url}/r/${shortId}` : `${url}/${username}/${slug}`;
  url = options.buildUrl ? `${url}/build` : url;

  return url;
};

export default getWebsiteUrl;
