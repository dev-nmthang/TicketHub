/* tslint:disable */
/* eslint-disable */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IListInfo } from '@pnp/sp/lists';
import * as React from "react";
import InlineItem from "../Common/InlineItem";
import { IFieldInfo } from "@pnp/sp/fields";
import { IListFormAttachment } from "./ListFormAttachments/ListFormAttachments";
import { IListItem } from "../Common/ListItemTypes";
import { BooleanFormStateValue, ChoiceFormStateValue, DateTimeFormStateValue, LookupFormStateValue, MultiChoiceFormStateValue, MultiLookupFormStateVale as MultiLookupFormStateValue, NumberFormStateValue, TextFormStateValue, UserFormStateValue } from "./FormStateValue";

type GetFormState<T> = (key: string) => T;
type SetFormState<T> = (key: string, value: T | ((oldValue: T) => T)) => void

export interface IListFormContext {
    readonly: boolean;
    disabled: boolean;
    list: IListInfo;
    listItem: any;
    fields: IFieldInfo[];
    formState: {
        get: <T = any> (...args: Parameters<GetFormState<T>>) => ReturnType<GetFormState<T>>,
        set: <T = any> (...args: Parameters<SetFormState<T>>) => ReturnType<SetFormState<T>>,
        getText: GetFormState<TextFormStateValue>,
        setText: SetFormState<TextFormStateValue>,
        getUsers: GetFormState<UserFormStateValue>,
        /**
         * Sets the array of users in the formState. In order to resolve a user either define the userId property or the loginName property.
         */
        setUsers: SetFormState<UserFormStateValue>,
        getDateTime: GetFormState<DateTimeFormStateValue>,
        setDateTime: SetFormState<DateTimeFormStateValue>,
        getLookup: GetFormState<LookupFormStateValue>,
        setLookup: SetFormState<LookupFormStateValue>,
        getMultiLookup: GetFormState<MultiLookupFormStateValue>,
        setMultiLookup: SetFormState<MultiLookupFormStateValue>,
        getChoice: GetFormState<ChoiceFormStateValue>,
        setChoice: SetFormState<ChoiceFormStateValue>,
        getMultiChoice: GetFormState<MultiChoiceFormStateValue>,
        setMultiChoice: SetFormState<MultiChoiceFormStateValue>,
        getBoolean: GetFormState<BooleanFormStateValue>,
        setBoolean: SetFormState<BooleanFormStateValue>,
        getNumber: GetFormState<NumberFormStateValue>,
        setNumber: SetFormState<NumberFormStateValue>,
    };
    isNewForm: boolean;
    itemId: number;
    webPartContext: WebPartContext;
    validation: {
        getErrorMessage: (key: string) => string;
        setErrorMessage: (key: string, errorMessage: string) => void;
        clearErrorMessages: () => void;
        hasErrorMessage: () => boolean;
    }
    attachments: {
        getAttachments: () => InlineItem<IListFormAttachment>[],
        getAttachmentsAndDeletedAttachments: () => InlineItem<IListFormAttachment>[],
        setAttachments: (attachments: InlineItem<IListFormAttachment>[]) => void
    };
    initialized: boolean;
    getFieldDefaultValue: (fieldInternalname: string) => any,
    getListItemFromFormState: <T extends IListItem = IListItem>() => Promise<T>,
    getField: (fieldInternalName: string) => IFieldInfo,
    saveListItem: (listItem: any, forceOverride?: boolean, folderPath?: string) => Promise<IListItem>
}


