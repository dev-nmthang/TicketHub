import { StatusBadgeColorPresets } from "../../../common/StatusBadge";


export enum Status {
  Draft = "Draft",
  Submitted = "Submitted",
}

// eslint-disable-next-line @typescript-eslint/typedef
export const statusColorConfiguration = {
  [Status.Draft]: StatusBadgeColorPresets.Draft,
  [Status.Submitted]: StatusBadgeColorPresets.Approved,
};
