import axios from './axios';

export type PrintWebsiteAsPdfParams = {
  username: string;
  slug: string;
};

export const printWebsiteAsPdf = (printWebsiteAsPdfParams: PrintWebsiteAsPdfParams): Promise<string> =>
  axios.get(`/printer/${printWebsiteAsPdfParams.username}/${printWebsiteAsPdfParams.slug}`).then((res) => res.data);
