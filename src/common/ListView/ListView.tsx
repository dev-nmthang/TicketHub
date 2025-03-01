/* tslint:disable */
/* eslint-disable */
import * as React from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IListInfo } from '@pnp/sp/lists';
import { Field, FieldTypes, IFieldInfo } from '@pnp/sp/fields/types';
import { ActionButton, ColumnActionsMode, DetailsList, DetailsListLayoutMode, DetailsRow, IColumn, IDetailsListProps, IDetailsRowProps, SelectionMode } from 'office-ui-fabric-react';
import { isEqual, isEqualWith, isFunction } from 'lodash';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ListViewColumnHeaderContextMenu } from './ListViewColumnHeaderContextMenu';
import ListViewFieldRenderer from './ListViewFieldRenderer';
import { ListViewService } from './ListViewService';
import { ListViewFilterPane } from './ListViewFilterPane';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

interface Dictionary<T> {
    [Key: string]: T;
}

interface IResponseContext {
    ctx?: any;
    items?: any[];
    pageRef?: string;
}

export interface IListviewColumn {
    fieldName?: string;
    detailsListColumn?: Partial<IColumn>;
}

export interface IListViewProps {
    listViewService: ListViewService;
    columns: IListviewColumn[];
    context: WebPartContext;
    onItemClick?: (item: any) => void;
    onLoadingStateChanged?: (loading: boolean) => void;
    detailsListProps?: Partial<IDetailsListProps>
}

export const ListView: React.FunctionComponent<IListViewProps> = (props: React.PropsWithChildren<IListViewProps>) => {
    const [items, setItems] = React.useState<any[]>([]);
    const [itemsLoading, setItemsLoading] = React.useState<boolean>(false);
    const [ctx, setCtx] = React.useState<any>({});
    const [listFields, setListFields] = React.useState<any[]>(null);
    const [columnHeaderContextMenuState, setColumnHeaderContextMenuState] = React.useState<{ column: IColumn, htmlTarget: HTMLElement }>(null);
    //const [sortedColumnKey, setSortedColumnKey] = React.useState<string>(null);
    //const [sortDescending, setSortDescending] = React.useState<boolean>(false);
    const [sortField, setSortField] = React.useState<{ SortField?: string, SortDir?: 'Asc' | 'Desc' }>({});
    const [filteringColumn, setFilteringColumn] = React.useState<IColumn>(null);
    const [filteringOptions, setFilteringOptions] = React.useState<string[]>(null);
    const [filterLoading, setFilterLoading] = React.useState<boolean>(false);
    const [filters, setFilters] = React.useState<{[key:string]: string[]}>({});
    const [pageRef, setPageRef] = React.useState<string>(null);
    const [itemsRefreshRequested, setItemsRefreshRequested] = React.useState<number>(0);

    // listViewColumns is a mirror of props.columns. Only changes when the props.columns deeply changes (compared with _isEqual and not by reference)
    const [listviewColumnNames, setListviewColumnNames] = React.useState<string[]>(null);

    // detailsListColumnDefinition is the column definition to be passed for DetailsList.
    const [detailsListColumnDefinition, setDetailsListColumnDefinition] = React.useState<IColumn[]>(null);

    //React References 
    const observer = React.useRef(null);

    const initListViewService = () => {
        if (props.listViewService) {
            props.listViewService.onForceRefresh(refreshItems)
        }
    }
    const cleanUpListViewService = () => {
        if (props.listViewService) {
            props.listViewService.offForceRefresh(refreshItems)
        }
    }

    const refreshItems = () =>{
        setItemsRefreshRequested((oldval:number)=> oldval + 1);
    }

    const initListViewColumnNames = () => {
        const columnNames = props.columns ? props.columns.filter(c => !!c.fieldName).map(c => c.fieldName) : null;

        //only update in case of real differences.
        if (!isEqual(columnNames, listviewColumnNames)) {
            setListviewColumnNames(columnNames);
        }
    }

    //handlers
    const handleColumnHeaderClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
        if (column.columnActionsMode !== ColumnActionsMode.disabled) {
            setColumnHeaderContextMenuState({ column: column, htmlTarget: ev.target as HTMLElement });
        }
    }
    const handleColumnHeaderContextMenuDismiss = () => {
        setColumnHeaderContextMenuState(null);
    }
    const handleFilterClick = (column: IColumn) => {
        setFilteringColumn(column);
    }
    const handleClearFilterClick = (column: IColumn) => {
        handleFilterChanged(column, []);
    }
    const handleFilterPaneDismiss = () => {
        setFilteringColumn(null);
        setFilteringOptions(null);
    }
    const handleFilterChanged = (column: IColumn, selectedCriterias: string[]) => {
        const newFilters = { ...filters };
        const filteredFieldInternalName = column.fieldName;

        newFilters[filteredFieldInternalName] = selectedCriterias;

        const filteredCol: IColumn = detailsListColumnDefinition.filter(c => c.key === column.key)[0];
        filteredCol.isFiltered = selectedCriterias.length > 0;
        setDetailsListColumnDefinition([...detailsListColumnDefinition]);

        setFilters(newFilters);
    }
    const handleSortClick = (column: IColumn, descending: boolean) => {

        //reset column sort
        detailsListColumnDefinition.forEach((column) => {
            column.isSorted = false;
            column.isSortedDescending = true;
        });
        //set sorted column
        const sortedCol: IColumn = detailsListColumnDefinition.filter(c => c.key === column.key)[0];
        sortedCol.isSortedDescending = descending;
        sortedCol.isSorted = true;

        setDetailsListColumnDefinition([...detailsListColumnDefinition]);
        setSortField({
            SortField: sortedCol.fieldName,
            SortDir: sortedCol.isSortedDescending ? 'Desc' : 'Asc'
        });
        //setSortedColumnKey(sortedCol.key);
        //setSortDescending(sortedCol.isSortedDescending);
    }


    // const handleIntersectionObserver = (entities: any[], observer: any) => {
    //     const y = entities[0].boundingClientRect.y;
    //     //console.log(`Intersection reached [ PrevY: ${prevY.current} | Y: ${y} ]`);

    //     if (prevY.current > y) {
    //         loadNextListItems();
    //     }
    //     prevY.current = y;
    // }

    const getResponseContext = async (payload?: { nextHref?: string, rowLimit?: number }): Promise<IResponseContext> => {
        let listItemsCtx: IResponseContext = { items: [] };

        setItemsLoading(true);

        const result: any = await props.listViewService.loadListItems(listviewColumnNames, payload.nextHref, payload.rowLimit, filters, sortField);
        listItemsCtx = {
            ctx: result,
            items: result && result.ListData ? result.ListData.Row : [],
            pageRef: result && result.ListData && result.ListData.NextHref && result.ListData.NextHref.substring(1)
        }

        setItemsLoading(false);


        return listItemsCtx;
    };

    const setResponseResult = (result: IResponseContext) => {
        setItems(result.items);
        setCtx(result.ctx);
        setPageRef(result.pageRef);
    };

    //load list items from sharepoint
    const loadListItems = async () => {
        if (props.listViewService && listviewColumnNames) {

            const rowLimit = items.length && items.length <= 5000 ? items.length : null;
            const result = await getResponseContext({ rowLimit: rowLimit });
            return setResponseResult(result);
        }
    }
    const loadNextListItems = async () => {
        if (props.listViewService && listviewColumnNames) {

            const result = await getResponseContext({ nextHref: pageRef });
            result.items = [...items, ...result.items];
            return setResponseResult(result);
        }
    }

    //load list field definitions from sharepoint
    const loadListFields = async () => {
        if (props.listViewService) {
            const fields = await props.listViewService.loadListFields();
            setListFields(fields);
        }
    }

    //create the column defintions for DetailsList
    const createDetailsListColumnDefinitions = () => {

        if (listFields && props.columns) {

            const cols: IColumn[] = props.columns.map(lisviewColumn => {
                const fieldInfo: IFieldInfo = ListViewService.getFieldInfo(listFields, lisviewColumn.fieldName);

                // if (!fieldInfo) {
                //     throw new Error(`List field doesnt exist with internal name: ${lisviewColumn.fieldName}`);
                // }

                const isFiltered = filters[lisviewColumn.fieldName]?.length > 0;
                const sorting: 'Asc' | 'Desc' = sortField?.SortField === lisviewColumn.fieldName ? sortField.SortDir : null;

                const column = createColumnDefinition(lisviewColumn, fieldInfo, isFiltered, sorting);
                if (fieldInfo) {
                    column.onColumnClick = handleColumnHeaderClick;
                }

                return column;
            })
            setDetailsListColumnDefinition(cols);
        }
    }

    async function setPossibleFilterCriterias  () {
        if (!props.context) {
            console.warn('Webpart context needed to enable listview filtering');
            return;
        }

        if (!filteringColumn || !ctx)
            return

        setFilterLoading(true);
        const fieldInternalName = filteringColumn.key;

        const defaultView: any = await sp.web.lists.getByTitle(ctx.ListTitle).defaultView();
        const web = await sp.web.get();
        const endPoint = `${web.Url}/_api/web/lists/getByTitle('${ctx.ListTitle}')/RenderListFilterData`;
        const query = `${endPoint}?FieldInternalName='${fieldInternalName}'&ViewId='${defaultView.Id}'`//&${indexedFilters}`
        const options = {
            headers: new Headers({
                "Accept": "application/json; odata=verbose"
            })
        };

        try {
            const response: SPHttpClientResponse = await props.context.spHttpClient.post(query, SPHttpClient.configurations.v1, options);
            const result = await response.text();

            setFilteringOptions(parseFilterValues(result));
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setFilterLoading(false);
        }
    }

    // const setIntersectionObserver = () => {
    //     var options = {
    //         root: null,
    //         rootMargin: "0px",
    //         threshold: 1.0
    //     };

    //     if (observer.current) {
    //         observer.current.unobserve(intersectionObserverRef.current);
    //     }

    //     if (pageRef) {
    //         observer.current = new IntersectionObserver(
    //             handleIntersectionObserver,
    //             options
    //         );
    //         observer.current.observe(intersectionObserverRef.current);
    //     }
    // }

    // React.useEffect(() => { if (items.length > 0 && intersectionObserverRef.current) setIntersectionObserver() }, [items, pageRef, intersectionObserverRef]);



    //useRef wont work for storing the node
    //https://medium.com/welldone-software/usecallback-might-be-what-you-meant-by-useref-useeffect-773bc0278ae
    const observedElementRef = React.useCallback(observedElement => {

        if (observer.current) {
            observer.current.disconnect();
        }

        const handleIntersectionObserver = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            const entry = entries[0];

            if (entry.isIntersecting) {

                //if there is something more to load
                if (pageRef) {
                    loadNextListItems();
                }

            }

        };

        const options: IntersectionObserverInit = {
            root: null,
            rootMargin: "0px",
            threshold: 1.0
        };


        observer.current = new IntersectionObserver(handleIntersectionObserver, options);

        if (observedElement) {
            observer.current.observe(observedElement);
        }

    }, [items, pageRef]);






    React.useEffect(() => { initListViewService(); return cleanUpListViewService }, [props.listViewService]);
    React.useEffect(() => { initListViewColumnNames(); }, [props.columns]);
    React.useEffect(() => { loadListFields(); }, [props.listViewService]);
    React.useEffect(() => { createDetailsListColumnDefinitions(); }, [listFields, props.columns]);
    React.useEffect(() => { loadListItems() }, [props.listViewService, listviewColumnNames, sortField, filters, itemsRefreshRequested]);
    React.useEffect(() => { setPossibleFilterCriterias() }, [filteringColumn, ctx]);
    React.useEffect(() => { if (pageRef && items.length == 0) loadNextListItems() }, [pageRef]);
    React.useEffect(() => { props.onLoadingStateChanged && props.onLoadingStateChanged(itemsLoading); }, [itemsLoading]);

    return detailsListColumnDefinition ? (
        <>
            <DetailsList
                items={items}
                compact={false}
                columns={detailsListColumnDefinition}
                selectionMode={SelectionMode.none}
                getKey={(item, index) => (item.UniqueId)}
                setKey="none"
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                // detailslist doesnt support onclick. Workaround:
                onRenderRow={(detailsRowProps: IDetailsRowProps, defaultRender: any) => {
                    return (
                        <div
                            // className={styles.noselect}
                            onClick={() => { props.onItemClick && props.onItemClick(detailsRowProps.item); }}
                        >
                            <DetailsRow {...detailsRowProps} />
                        </div>
                    )
                }}
                {...props.detailsListProps}
            />
            {/* {pageRef && 
                <ActionButton text='Load More ...' onClick={loadNextListItems} />
            } */}
            <div ref={observedElementRef}></div>
            {columnHeaderContextMenuState &&
                <ListViewColumnHeaderContextMenu
                    column={columnHeaderContextMenuState.column}
                    htmlTarget={columnHeaderContextMenuState.htmlTarget}
                    onDismiss={handleColumnHeaderContextMenuDismiss}
                    onFilterClick={handleFilterClick}
                    onClearFilterClick={handleClearFilterClick}
                    onSortClick={handleSortClick}
                />
            }
            {filteringColumn &&
                <ListViewFilterPane
                    filterColumn={filteringColumn}
                    possibleFilterCriterias={filteringOptions}
                    selectedFilterCriterias={filters[filteringColumn.fieldName] || []}
                    onDismiss={handleFilterPaneDismiss}
                    onFilterChanged={handleFilterChanged}
                    loading={filterLoading}
                />
            }

        </>
    ) : null;
};


const createColumnDefinition = (listviewColumn: IListviewColumn, fieldInfo: IFieldInfo, isFiltered: boolean, sorting: 'Asc' | 'Desc'): IColumn => {

    const defaultProperties: IColumn = {
        key: null,
        name: fieldInfo ? fieldInfo.Title : '',
        minWidth: 20,
        maxWidth: 120,
        isResizable: true,
        isPadded: true,
        columnActionsMode: fieldInfo ? ColumnActionsMode.hasDropdown : ColumnActionsMode.disabled,
        onRender: ListViewFieldRenderer.getRenderFunction(fieldInfo),
        isSortedDescending: sorting === 'Desc',
        isSorted: !!sorting,
        isFiltered: isFiltered
    }

    const userDefinedProperties: Partial<IColumn> = (listviewColumn.detailsListColumn ? listviewColumn.detailsListColumn : {});

    const overrideProperties: Partial<IColumn> = {
        key: listviewColumn.fieldName,
        fieldName: listviewColumn.fieldName
    }

    let column: IColumn = { ...defaultProperties, ...userDefinedProperties, ...overrideProperties };

    return column;
}

const parseFilterValues = (filterValues: string) => {
    const parser = new DOMParser();
    const parsedValues = parser.parseFromString(filterValues, 'text/html');
    const options = parsedValues.getElementsByTagName('option');
    let values = [];

    for (let i = 0; i < options.length; i++) {
        if (options[i].value && options[i].value.length)
            values.push(options[i].value);
    }
    return values;
}