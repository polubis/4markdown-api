import { Plan } from "@domain/atoms/general";

type AccountPermissionModel = {
  // Is verified by the admin
  trusted?: boolean;
  // Plan of the account
  plan?: Plan;
};

export type { AccountPermissionModel };
