/* tslint:disable */
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {  IListFormFieldRendererProps } from '.';
import {  IBasePickerSuggestionsProps, IPersonaProps,  NormalPeoplePicker } from 'office-ui-fabric-react';
import * as React from 'react';
import { sp, PrincipalType, PrincipalSource } from '@pnp/sp/presets/all';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import styles from './ListFormField_User.module.scss';
import { IPeoplePickerUser } from '../../PeoplePicker/IPeoplePickerUser';
import { UserFormStateValue } from '../FormStateValue';

const MAXIMUM_SUGGESTION = 5;

export const ListFormField_User: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;

    const selectionLimit = (field as any)['AllowMultipleValues'] ? 1000 : 1;
    const groupId:number = (field as any)['SelectionGroup'] ?? null

    const selectedItems = listFormContext.formState.get<UserFormStateValue>(formStateKey);

    const resolveFormStateUsers = async () => {

        if (selectedItems) {

            const newPeoplePickerUsers = [...selectedItems];

            let resolutionHappened = false;

            const promises = newPeoplePickerUsers.map(async (peoplePickerUser, index: number) => {

                if (!peoplePickerUser.text && !peoplePickerUser.secondaryText) {
                    //the user is not yet resolved

                    if (peoplePickerUser.loginName) {
                        const searchString = peoplePickerUser.loginName.split('|').pop();
                        const result = await searchPeople(searchString, props.listFormContext.webPartContext, groupId);
                        const resolvedPeoplePickerUser = result[0];
                        if (resolvedPeoplePickerUser) {
                            newPeoplePickerUsers[index] = resolvedPeoplePickerUser;
                            resolutionHappened = true;
                        }

                    }
                    else if (peoplePickerUser.userId) {
                        const result = await sp.web.siteUsers.getById(peoplePickerUser.userId).get();
                        if (result){
                            // eslint-disable-next-line require-atomic-updates
                            peoplePickerUser.loginName = result.LoginName;
                            resolutionHappened = true;
                        }
                    }

                }

            });

            await Promise.all(promises);

            if (resolutionHappened) {
                listFormContext.formState.set<UserFormStateValue>(formStateKey, newPeoplePickerUsers);
            }
        }

    }

    const onItemsChange = (items?: IPeoplePickerUser[]): void => {
        const newItems = [...(items || [])];
        listFormContext.formState.set<UserFormStateValue>(formStateKey, newItems);
        //trigger onchange
        props.onChange && props.onChange(newItems);
    };

    const handleResolveSuggestion = async (filter: string, selectedItems?: IPeoplePickerUser[]): Promise<IPeoplePickerUser[]> => {
        if (filter.length > 2) {
            const peoplePickerUsers = await searchPeople(filter, listFormContext.webPartContext, groupId);
            const noDuplicatePeoplePickerUser = peoplePickerUsers.filter(peoplePickerUser => !selectedItems || selectedItems.filter(selectedItem => selectedItem.text === peoplePickerUser.text).length === 0); //Filter out duplicates
            return noDuplicatePeoplePickerUser;
        } else {
            return [];
        }
    }

    React.useEffect(() => { resolveFormStateUsers(); }, [selectedItems]);

    const readonlyClassName = props.readonly ? styles.Readonly : '';

    return (
        <NormalPeoplePicker
          
            onResolveSuggestions={handleResolveSuggestion}
            getTextFromItem={(peoplePersonaMenu: IPersonaProps) => peoplePersonaMenu.text}
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            pickerSuggestionsProps={suggestionProps}
            className={`ms-PeoplePicker ${props.controlProps ? props.controlProps.className || '' : ''} ${readonlyClassName}`}
            key={'controlled'}
            removeButtonAriaLabel={'Remove'}
            selectedItems={selectedItems}
            onChange={onItemsChange}
            inputProps={{
                'aria-label': 'People Picker',
                placeholder: props.controlProps ? props.controlProps.placeholder || '' : ''
            }}
            resolveDelay={400}
            disabled={props.disabled || props.readonly}
            itemLimit={selectionLimit}
            {...props.controlProps}
        />

    );
};

const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: 'Suggested People',
    mostRecentlyUsedHeaderText: 'Suggested Contacts',
    noResultsFoundText: 'No results found',
    loadingText: 'Loading',
    showRemoveButtons: false,
    suggestionsAvailableAlertText: 'People Picker Suggestions available',
    suggestionsContainerAriaLabel: 'Suggested contacts',
};


export const generateUserPhotoLink = (webAbsoluteUrl: string, value: string): string => {
    return `${webAbsoluteUrl}/_layouts/15/userphoto.aspx?accountname=${encodeURIComponent(value)}&size=M`;
}

const getFullNameInitials = (fullName: string): string => {
    if (fullName === null) {
        return fullName;
    }

    const words: string[] = fullName.split(' ');
    if (words.length === 0) {
        return '';
    } else if (words.length === 1) {
        return words[0].charAt(0);
    } else {
        return (words[0].charAt(0) + words[1].charAt(0));
    }
}

const searchPeople = async (searchString: string, webPartContext: WebPartContext, groupId:number): Promise<IPeoplePickerUser[]> => {

    const result = await sp.profiles.clientPeoplePickerSearchUser({
        AllowEmailAddresses: true,
        AllowMultipleEntities: false,
        AllowOnlyEmailAddresses: false,
        AllUrlZones: false,
        MaximumEntitySuggestions: MAXIMUM_SUGGESTION,
        PrincipalSource: PrincipalSource.All,
        PrincipalType: PrincipalType.User,
        QueryString: searchString,
        SharePointGroupID: groupId
    });

    const filteredResult = result
        .filter(v => !(v.EntityData && v.EntityData.PrincipalType && v.EntityData.PrincipalType === "UNVALIDATED_EMAIL_ADDRESS"))            // Filter out "UNVALIDATED_EMAIL_ADDRESS"
        .filter(v => v.Key !== null)            // Filter out NULL keys

    const webAbsoluteUrl = webPartContext.pageContext.web.absoluteUrl;

    const peoplePickerUser = filteredResult.map<IPeoplePickerUser>(peoplePickerEntity => ({
        id: peoplePickerEntity.Key,
        loginName: peoplePickerEntity.Key,
        imageUrl: generateUserPhotoLink(webAbsoluteUrl, peoplePickerEntity.Description || ''),
        imageInitials: getFullNameInitials(peoplePickerEntity.DisplayText),
        text: peoplePickerEntity.DisplayText, // name
        secondaryText: (peoplePickerEntity.EntityData ? peoplePickerEntity.EntityData.Email : null) || peoplePickerEntity.Description, // email
        tertiaryText: "", // status
        optionalText: "" // anything
    }));

    return peoplePickerUser;
}