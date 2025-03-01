/* tslint:disable */
/* eslint-disable */
import { sp } from "@pnp/sp/presets/all";
import { IAppParametersService, IImageField, IParameterConfig, IPeopleField } from "./AppParametersInterfaces";
import { paramTypesMatrix } from "./AppParametersTypeMatrix";

export const appParametersListName = 'AppParameters';

export class AppParametersService {
    constructor (configuration?: IAppParametersService) {
    }

    protected getParameter = async(parameterName: string, parameterType: IParameterConfig) : Promise<any> => {
        const viewXML: string = `
            <View>
                <ViewFields>
                    <FieldRef Name="${parameterType.valueField}" />
                    <FieldRef Name="ParameterType" />
                </ViewFields>
                <Query>
                    <Where>
                        <Eq><FieldRef Name="Title" /><Value Type="Text">${parameterName}</Value></Eq>
                    </Where>
                </Query>
            </View>`;
        const result = await sp.web.lists.getByTitle(appParametersListName).renderListDataAsStream({ViewXml: viewXML});
        return result.Row;
    }

    protected tryGetValue = async (parameterName: string, parameterType: IParameterConfig): Promise<any> => {
        const param = await this.getParameter(parameterName, parameterType);
        if(!param.length){
            throw new Error(`No parameter found for '${parameterName}'`);
        }
        if(param.length > 1) {
            throw new Error(`Multiple parameters found for '${parameterName}'`);
        }
        if(param[0].ParameterType !== parameterType.choiceValue){
            throw new Error(`Type mismatch for '${parameterName}'. Expected type: '${parameterType.choiceValue}' - Found type: '${param[0].ParameterType}'`)
        }

        return param[0][parameterType.valueField];
    }
    protected tryGetValueAsJson = async (parameterName: string, parameterType: IParameterConfig): Promise<any> => {
        const value = await this.tryGetValue(parameterName, parameterType);
        return JSON.parse(value);
    }

    public getParameterString = async (parameterName: string) : Promise<string> => {
        return this.tryGetValue(parameterName, paramTypesMatrix.stringSingle);
    }
    public getParameterStringMultiple = async (parameterName: string) : Promise<string> => {
        return this.tryGetValue(parameterName, paramTypesMatrix.stringMultiple);
    }
    public getParameterStringMultipleExtended = async (parameterName: string) : Promise<string> => {
        return this.tryGetValue(parameterName, paramTypesMatrix.stringMultipleExtended);
    }
    public getParameterNumber = async (parameterName: string) : Promise<Number> => {
        const value = await this.tryGetValue(parameterName, paramTypesMatrix.number);
        return Number(value) || null;
    }
    public getParameterBoolean = async (parameterName: string) : Promise<boolean> => {
        return this.tryGetValue(parameterName, paramTypesMatrix.boolean);
    }
    public getParameterDate = async (parameterName: string) : Promise<Date> => {
        const value = await this.tryGetValue(parameterName, paramTypesMatrix.date);
        return new Date(value) || null;
    }
    public getParameterPeopleSingle = async (parameterName: string) : Promise<IPeopleField> => {
        const value = await this.tryGetValue(parameterName, paramTypesMatrix.peopleSingle);
        return value[0] || null;
    }
    public getParameterPeopleMultiple = async (parameterName: string) : Promise<IPeopleField[]> => {
        return this.tryGetValue(parameterName, paramTypesMatrix.peopleMultiple);
    }
    public getParameterImage = async (parameterName: string) : Promise<IImageField> => {
        return this.tryGetValue(parameterName, paramTypesMatrix.image);
    }
    public getParameterJSON = async (parameterName: string) : Promise<Object> => {
        return this.tryGetValueAsJson(parameterName, paramTypesMatrix.json);
    }

}