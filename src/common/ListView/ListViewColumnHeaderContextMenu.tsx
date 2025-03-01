/* tslint:disable */
/* eslint-disable */
import { ContextualMenu, ContextualMenuItemType, DirectionalHint, IColumn, IContextualMenuItem } from 'office-ui-fabric-react';
import * as React from 'react';

export interface IListViewColumnHeaderContextMenuProps {
    column: IColumn;
    htmlTarget: HTMLElement;
    onSortClick: (column:IColumn, descending: boolean)=>void;
    onDismiss:  ()=>void;
    onFilterClick: (column:IColumn)=>void;
    onClearFilterClick: (column:IColumn)=>void;
}

export const ListViewColumnHeaderContextMenu: React.FunctionComponent<IListViewColumnHeaderContextMenuProps> = (props: React.PropsWithChildren<IListViewColumnHeaderContextMenuProps>) => {

    const contextMenuItems: IContextualMenuItem[] = [
        {
            key: 'section_sort',
            itemType: ContextualMenuItemType.Section,
            sectionProps: {
                topDivider: true,
                bottomDivider: true,
                title: 'Sort',
                items: [
                    {
                        key: 'aToZ',
                        name: 'A to Z',
                        iconProps: { iconName: 'SortUp' },
                        canCheck: true,
                        checked: props.column.isSorted && !props.column.isSortedDescending,
                        onClick: () => props.onSortClick(props.column, false)
                    },
                    {
                        key: 'zToA',
                        name: 'Z to A',
                        iconProps: { iconName: 'SortDown' },
                        canCheck: true,
                        checked: props.column.isSorted && props.column.isSortedDescending,
                        onClick: () => props.onSortClick(props.column, true)
                    }
                ]
            }
        },
        {
            key: 'section_filter',
            itemType: ContextualMenuItemType.Section,
            sectionProps: {
                topDivider: true,
                bottomDivider: true,
                title: 'Filter',
                items: [
                    {
                        key: 'filter_key',
                        name: 'Filter by',
                        iconProps: { iconName: 'Filter' },
                        onClick: () => props.onFilterClick(props.column)
                    },
                    ... props.column.isFiltered 
                    ?   [{
                            key: 'clearfilter_key',
                            name: 'Clear Filter(s)',
                            iconProps: { iconName: 'ClearFilter' },
                            onClick: () => props.onClearFilterClick(props.column)
                        }]
                    :   []
                ]
            }
        }
    ];

    return (
        <>
            <ContextualMenu
                items={contextMenuItems}
                target={props.htmlTarget}
                directionalHint={DirectionalHint.bottomLeftEdge}
                gapSpace={0}
                isBeakVisible={false}
                onDismiss={props.onDismiss}
            />
        </>
    );
};
