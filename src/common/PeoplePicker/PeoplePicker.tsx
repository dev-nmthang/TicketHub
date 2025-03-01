/* tslint:disable */
/* eslint-disable */
import { PrincipalSource, PrincipalType, sp } from '@pnp/sp';
import * as React from 'react';
import { IBasePickerSuggestionsProps, IPersonaProps, NormalPeoplePicker } from 'office-ui-fabric-react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IPeoplePickerUser } from './IPeoplePickerUser';


export interface IPeoplePickerProps {
    webPartContext: WebPartContext;
    selectedUsers: IPeoplePickerUser[];
    setSelectedUsers: (users: IPeoplePickerUser[]) => void;
    disabled?: boolean;
    className?: string;
    maximumSuggestion?: number;
    filterGroupId?: number;
    selectionLimit?: number;
}

const START_SEARCHING_AFTER_INPUT_CHARACTER = 2;

export const PeoplePicker: React.FunctionComponent<IPeoplePickerProps> = (props: React.PropsWithChildren<IPeoplePickerProps>) => {

    const handleResolveSuggestion = async (filter: string, selectedItems?: IPeoplePickerUser[]): Promise<IPeoplePickerUser[]> => {
        if (filter.length > START_SEARCHING_AFTER_INPUT_CHARACTER) {
            const groupId = props.filterGroupId ?? 0; //no group filtering by default
            const maximumSuggestion = props.maximumSuggestion ?? 5
            const peoplePickerUsers = await searchPeople(filter, props.webPartContext, groupId, maximumSuggestion);
            const noDuplicatePeoplePickerUser = peoplePickerUsers.filter(peoplePickerUser => !selectedItems || selectedItems.filter(selectedItem => selectedItem.text === peoplePickerUser.text).length === 0); //Filter out duplicates
            return noDuplicatePeoplePickerUser;
        } else {
            return [];
        }
    }


    const resolveSelectedUsers = async () => {
        const peoplePickerUsers: IPeoplePickerUser[] = props.selectedUsers;

        if (peoplePickerUsers) {

            const newPeoplePickerUsers = [...peoplePickerUsers];

            let resolutionHappened = false;

            const promises = newPeoplePickerUsers.map(async (peoplePickerUser, index: number) => {

                if (!peoplePickerUser.text && !peoplePickerUser.secondaryText) {
                    //the user is not yet resolved

                    if (peoplePickerUser.loginName) {
                        const searchString = peoplePickerUser.loginName.split('|').pop();
                        const filterGroupId = 0 // no need for filtering when resolving client defined users.
                        const numberOfSuggestions = 1;
                        const result = await searchPeople(searchString, props.webPartContext, filterGroupId, numberOfSuggestions);
                        const resolvedPeoplePickerUser = result[0];
                        if (resolvedPeoplePickerUser) {
                            newPeoplePickerUsers[index] = resolvedPeoplePickerUser;
                            resolutionHappened = true;
                        }

                    }
                    else if (peoplePickerUser.userId) {
                        const result = await sp.web.siteUsers.getById(peoplePickerUser.userId).get();
                        if (result) {
                            peoplePickerUser.loginName = result.LoginName;
                            resolutionHappened = true;
                        }
                    }

                }

            });

            await Promise.all(promises);

            if (resolutionHappened) {
                props.setSelectedUsers(newPeoplePickerUsers);
            }
        }

    }

    const onItemsChange = (items?: IPeoplePickerUser[]): void => {
        const newItems = items ?? [];
        props.setSelectedUsers(newItems);
    };


    React.useEffect(() => { resolveSelectedUsers(); }, [props.selectedUsers]);

    return <NormalPeoplePicker
        onResolveSuggestions={handleResolveSuggestion}
        getTextFromItem={(peoplePersonaMenu: IPersonaProps) => peoplePersonaMenu.text}
        pickerSuggestionsProps={peoplePickerSuggestionProps}
        className={`ms-PeoplePicker ${props.className ?? ''}`}
        key={'controlled'}
        removeButtonAriaLabel={'Remove'}
        selectedItems={props.selectedUsers}
        onChange={onItemsChange}
        inputProps={{
            'aria-label': 'People Picker',
            placeholder: 'Search user...'
        }}
        resolveDelay={400}
        disabled={props.disabled}
        itemLimit={props.selectionLimit ?? 1000}
    />

};


const peoplePickerSuggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: 'Suggested People',
    mostRecentlyUsedHeaderText: 'Suggested Contacts',
    noResultsFoundText: 'No results found',
    loadingText: 'Loading',
    showRemoveButtons: false,
    suggestionsAvailableAlertText: 'People Picker Suggestions available',
    suggestionsContainerAriaLabel: 'Suggested contacts',
};


const searchPeople = async (searchString: string, webPartContext: WebPartContext, groupId: number, maximumSuggestion: number): Promise<IPeoplePickerUser[]> => {

    const result = await sp.profiles.clientPeoplePickerSearchUser({
        AllowEmailAddresses: true,
        AllowMultipleEntities: false,
        AllowOnlyEmailAddresses: false,
        AllUrlZones: false,
        MaximumEntitySuggestions: maximumSuggestion,
        PrincipalSource: PrincipalSource.All,
        PrincipalType: PrincipalType.User,
        QueryString: searchString,
        SharePointGroupID: groupId,
        
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

const generateUserPhotoLink = (webAbsoluteUrl: string, value: string): string => {
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

const getUserId = async (user:IPeoplePickerUser ): Promise<number> => {
    let userId: number = null;
    if (user) {
        const result = await sp.web.ensureUser(user.loginName);
        userId = result.data.Id;
    }
    return userId;
}