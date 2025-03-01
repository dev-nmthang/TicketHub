/* tslint:disable */
/* eslint-disable */
import { IPeoplePickerUser } from "../PeoplePicker";

export type TextFormStateValue = string;
export type NumberFormStateValue = number;
export type ChoiceFormStateValue = string;
export type MultiChoiceFormStateValue = string[];
export type BooleanFormStateValue = boolean;
export type DateTimeFormStateValue = Date;
export type LookupFormStateValue = { Id: number, Title?: string, [key: string]: string | number | undefined };
export type MultiLookupFormStateVale = LookupFormStateValue[];
export type UserFormStateValue = IPeoplePickerUser[];
