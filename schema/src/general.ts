export type Contact = {
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
};

export type Social = {
  id?: string;
  network: string;
  username: string;
  url?: string;
};

export type PhotoShape = 'square' | 'rounded-square' | 'circle';

export type PhotoFilters = {
  size: number;
  shape: PhotoShape;
  border: boolean;
  grayscale: boolean;
};

export type Photo = {
  url?: string;
  visible: boolean;
  filters: PhotoFilters;
};

export type General = {
  name: string;
  photo: Photo;
  headline: string;
  summary: string;
  contact: Contact;
  social: Social[];
};
