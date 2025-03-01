/* tslint:disable */
/* eslint-disable */
import { IPersonaProps } from "office-ui-fabric-react";

// export interface IPeoplePickerUser extends IPersonaProps {
export interface IPeoplePickerUser {
    loginName?: string;
    userId?: number;
    id?: string;
    imageInitials?: string;
    imageUrl?: string;
    optionalText?: string;
    secondaryText?: string;
    tertiaryText?: string;
    text?: string;
}