import type { Id, Date } from '../../application/utils/validators';

type AvatarVariant = {
  id: Id;
  h: number;
  w: number;
  src: string;
  ext: `webp`;
};

type UserProfileModel = {
  displayName: string | null;
  avatar: {
    tn: AvatarVariant;
    sm: AvatarVariant;
    md: AvatarVariant;
    lg: AvatarVariant;
  } | null;
  bio: string | null;
  githubUrl: string | null;
  fbUrl: string | null;
  linkedInUrl: string | null;
  blogUrl: string | null;
  twitterUrl: string | null;
  id: Id;
  cdate: Date;
  mdate: Date;
};

export type { UserProfileModel };
