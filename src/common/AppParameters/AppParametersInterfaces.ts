/* tslint:disable */
/* eslint-disable */
export interface IAppParametersService {

}

export interface IParameterConfig {
    choiceValue: string;
    valueField: string;
}

export interface IPeopleField {
    id: string;
    title: string;
    email: string;
    sip: string;
    picture: string;
    jobTitle: string;
    department: string;
}

export interface IImageField {
    fileName: string;
    id: string;
    serverRelativeUrl: string;
    serverUrl: string;
    thumbnailRenderer: {
        fileVersion: number;
        spItemUrl: string;
        sponsorToken: string;
    }
}