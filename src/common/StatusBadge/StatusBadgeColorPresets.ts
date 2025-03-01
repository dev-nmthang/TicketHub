/* tslint:disable */
/* eslint-disable */
export interface IBadgeColor {
    bgcolor: string;
    color?: string;
}

export const getStatusBadgeColor = (status: string): IBadgeColor => {
    const propertyNames = Object.getOwnPropertyNames(colors);
    const getComparableStatusName = (statusname: string) => statusname?.replace(/[^a-z0-9+]+/gi, '').toLowerCase();
    const matchingKey = propertyNames.filter(propertyName => getComparableStatusName(status) === getComparableStatusName(propertyName))[0];
    return colors[matchingKey] ?? colors.Default;
}

const colors: { [key: string]: IBadgeColor } = {
    Draft: { bgcolor: '#eeeeee', color: '#494949' },
    Submitted: { bgcolor: '#bcaaa4', color: '#40241a' },
    Pending: { bgcolor: '#ffcc80', color: '#c25e00' },
    WaitingForApproval: { bgcolor: '#ffcc80', color: '#c25e00' },
    UnderReview: { bgcolor: '#fff59d', color: '#c6a700' },
    Approved: { bgcolor: '#a5d6a7', color: '#00701a' },
    Rejected: { bgcolor: '#ff8a80', color: '#9b0000' },
    Ongoing: { bgcolor: '#b3e5fc', color: '#007ac1' },
    Completed: { bgcolor: '#80cbc4', color: '#005b4f' },
    Closed: { bgcolor: '#757575', color: '#000000' },
    Cancelled: { bgcolor: '#b0bec5', color: '#29434e' },
    Deleted: { bgcolor: '#9fa8da', color: '#00227b' },
    Removed: { bgcolor: '#9fa8da', color: '#00227b' },
    OnHold: { bgcolor: '#d1c4e9', color: '#320b86' },
    Default: { bgcolor: '#fafafa', color: '#212121' },
}

export class StatusBadgeColorPresets {
    public static readonly Draft: IBadgeColor = getStatusBadgeColor('draft');
    public static readonly Submitted: IBadgeColor = getStatusBadgeColor('submitted');
    public static readonly Pending: IBadgeColor = getStatusBadgeColor('Pending');
    public static readonly WaitingForApproval: IBadgeColor = getStatusBadgeColor('WaitingForApproval');
    public static readonly UnderReview: IBadgeColor = getStatusBadgeColor('UnderReview');
    public static readonly Approved: IBadgeColor = getStatusBadgeColor('Approved');
    public static readonly Rejected: IBadgeColor = getStatusBadgeColor('Rejected');
    public static readonly Ongoing: IBadgeColor = getStatusBadgeColor('Ongoing');
    public static readonly Completed: IBadgeColor = getStatusBadgeColor('Completed');
    public static readonly Closed: IBadgeColor = getStatusBadgeColor('Closed');
    public static readonly Cancelled: IBadgeColor = getStatusBadgeColor('Cancelled');
    public static readonly Deleted: IBadgeColor = getStatusBadgeColor('Deleted');
    public static readonly Removed: IBadgeColor = getStatusBadgeColor('Removed');
    public static readonly OnHold: IBadgeColor = getStatusBadgeColor('OnHold');
    public static readonly Default: IBadgeColor = getStatusBadgeColor('Default');
}