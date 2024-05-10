import { DateStamp, Id } from './general';

type Avatar = {
  h: number;
  w: number;
  src: string;
};

type UserProfileEntityFieldAvatar = {
  tn: Avatar;
  sm: Avatar;
  md: Avatar;
  lg: Avatar;
};

type UserProfileEntity = {
  id: Id;
  mdate: DateStamp;
  cdate: DateStamp;
  displayName: string | null;
  bio: string | null;
  avatar: UserProfileEntityFieldAvatar | null;
  githubUrl: string | null;
  fbUrl: string | null;
  linkedInUrl: string | null;
  blogUrl: string | null;
  twitterUrl: string | null;
};

export type { UserProfileEntity, UserProfileEntityFieldAvatar };
