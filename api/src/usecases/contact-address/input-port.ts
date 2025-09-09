import { ContactType } from 'src/domains/type/contact';

export type ContactAddressSaveDto = {
  id?: string;
  value: string;
  type: ContactType;
};
