/* tslint:disable */
/* eslint-disable */
import { sp } from "@pnp/sp";
import { IFieldInfo } from "@pnp/sp/fields";
import { IListInfo } from "@pnp/sp/lists";
import { filteredAssign } from "@uifabric/utilities";

export interface IListViewServiceConfig {
    listName: string;
    camlQuery?: string;
    inPlaceSearchText?: string;
    rowLimit?: number
}

export class ListViewService {

    constructor(configuration: IListViewServiceConfig) {

        this.listViewServiceEventTarget = new EventTarget();

        this.listName = configuration.listName;
        this.camlQuery = configuration.camlQuery;
        this.searchQuery = configuration.inPlaceSearchText;
        this.rowLimit = configuration.rowLimit ?? 100;
    }

    protected listViewServiceEventTarget: EventTarget;
    protected listName: string;
    protected camlQuery: string;
    protected searchQuery: string;
    protected rowLimit: number;

    public loadList = async (): Promise<IListInfo> => {
        const listInfo: IListInfo = await sp.web.lists.getByTitle(this.listName).get();
        return listInfo;
    }
    public loadListFields = async (): Promise<IFieldInfo[]> => {
        const fieldInfos = await sp.web.lists.getByTitle(this.listName).fields();
        // const visiblefields = fieldInfos.filter(f => f.Hidden === false);
        return fieldInfos;
    }
    public static getFieldInfo = (listFields: any[], internalName: string): IFieldInfo => {
        return listFields.filter(f => f.InternalName === internalName)[0];
    }

    public loadListItems = async (
        columns?: string[], 
        pageRef?: string, 
        rowLimit?: number, 
        filters: {[key:string]: string[]} = {},
        sortField?: any
    ): Promise<any> => {
        //return await sp.web.lists.getByTitle(listName).items.getAll(); = []

        let camlQuery;
        const finalRowLimit = rowLimit && rowLimit > this.rowLimit 
            ? rowLimit 
            : this.rowLimit

        if (this.camlQuery) {

            if (columns) {

                //if columns were defined substitute / injext the ViewFields node in the specified CAML query

                const parser = new DOMParser();
                const xml = parser.parseFromString(this.camlQuery, 'text/xml');
                
                //Append the base view properties
                const rowLimitElement = xml.createElement('RowLimit');
                rowLimitElement.setAttribute('Paged', 'TRUE');
                rowLimitElement.innerHTML = finalRowLimit.toString();

                //create new ViewFilds node
                const newViewFieldsElement = xml.createElement('ViewFields');
                const viewElement = xml.children[0]

                //remove old ViewFields element if any
                const oldViewFieldElement = xml.getElementsByTagName('ViewFields')[0];
                if (oldViewFieldElement) {
                    const oldFieldRefsString = oldViewFieldElement.innerHTML;

                    //append the old FieldRefs to the new ViewFields node
                    newViewFieldsElement.innerHTML = oldFieldRefsString;

                    oldViewFieldElement.remove();
                }

                //append to the View node
                viewElement.appendChild(newViewFieldsElement);
                viewElement.appendChild(rowLimitElement);
                
                //create FieldRef nodes from the column definition
                columns.forEach(columnName => {
                    const fieldRefElement = xml.createElement('FieldRef');
                    fieldRefElement.setAttribute('Name', columnName);
                    newViewFieldsElement.appendChild(fieldRefElement);
                });

                camlQuery = viewElement.outerHTML;
            }
            else {
                camlQuery = this.camlQuery;
            }
        }
        else {

            columns = columns || ['Title']; //show Title if no columns are specified
            const viewFieldsString = columns.map(colName => `<FieldRef Name="${colName}" />`).join('');

            camlQuery = `
                <View>
                    <ViewFields>
                        ${viewFieldsString}
                    </ViewFields>
                    <Query>
                    </Query>
                    <RowLimit Paged="TRUE">${finalRowLimit}</RowLimit>
                </View>`;
        }

        const overrideParams: any = {};

        const query = new Map<string, string>();

        Object.keys(filters)
        .filter((key:string) => 
            filters[key] && filters[key].length > 0
        )
        .forEach((key, index) => {
            if(filters[key].length == 1){
                query.set(`FilterField${index + 1}`, key)
                query.set(`FilterValue${index + 1}`, filters[key][0])
                //query.set(`FilterType${index + 1}`, 'In')
            }
            else {
                query.set(`FilterFields${index + 1}`, key)
                query.set(`FilterValues${index + 1}`, encodeURIComponent(filters[key].join(';#')))
                query.set(`FilterOp${index + 1}`, 'In')
            }
        });

        Object.keys(sortField).forEach(key => 
            query.set(key, sortField[key])    
        );

        if(this.searchQuery){
            query.set('InplaceSearchQuery', this.searchQuery);
        }

        //query.set("TryNewExperienceSingle", "TRUE");    

        const result = await sp.web.lists.getByTitle(this.listName).renderListDataAsStream(
            { 
                ViewXml: camlQuery,
                ReplaceGroup: true,
                AddRequiredFields: true,
                AllowMultipleValueFilterForTaxonomyFields: true,
                RenderOptions: 1183751,
                Paging: pageRef,
            },
            overrideParams,
            query
        )

        return result;
    }

    public forceRefresh = () => {
        this.listViewServiceEventTarget.dispatchEvent(new Event('ForceRefresh'))
    }

    public onForceRefresh = (callback: () => void) => {
        this.listViewServiceEventTarget.addEventListener('ForceRefresh',callback);
    }
    public offForceRefresh = (callback: () => void) => {
        this.listViewServiceEventTarget.removeEventListener('ForceRefresh',callback);
    }



}