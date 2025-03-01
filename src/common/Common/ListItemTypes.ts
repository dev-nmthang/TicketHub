/* tslint:disable */
/* eslint-disable */
export type ListItemUser = any;

export interface IListItem {
    Id: number;
    Title: string;
    Author: ListItemUser;
    Editor: ListItemUser;
    Modified: string;
    Created:string;
    // [key: string]: any;
}
