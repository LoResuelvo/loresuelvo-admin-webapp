export type Consumer = Readonly<{
  id: number;
  name: string;
  surname: string;
  email: string;
  profilePhotoUrl?: string;
  createdOn: string;
}>;
