/* tslint:disable */
/* eslint-disable */
import { Checkbox, DefaultButton, IColumn, Panel, PanelType, SearchBox, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './ListViewFilterPane.module.scss';

export interface IListViewFilterPaneProps {
    possibleFilterCriterias: string[];
    selectedFilterCriterias: string[];
    onDismiss: () => void;
    onFilterChanged: (column: IColumn, selectedCriterias: string[]) => void;
    filterColumn: IColumn;
    loading?: boolean;
}

export const ListViewFilterPane: React.FunctionComponent<IListViewFilterPaneProps> = (props: React.PropsWithChildren<IListViewFilterPaneProps>) => {

    const [searchText,setSearchText] = React.useState<string>('');
    const [filters, setFilters] = React.useState<string[]>([]);

    const clearFilters = () => {
        //props.onFilterChanged(props.filterColumn, []);
        setFilters([]);
        setSearchText('');
    }

    const applyFilters = () => {
        props.onFilterChanged(props.filterColumn, filters);
        props.onDismiss();
    }

    const handleFilterChanged = (criteria:string, checked: boolean) => {

        let newFilterCriterias;

        if (checked) {
            newFilterCriterias = [...filters, criteria];
        }
        else {
            newFilterCriterias = [...filters].filter(x => x !== criteria);
        }

        setFilters(newFilterCriterias);
    }

    const handleSearch = (searchText:string)=>{
        setSearchText(searchText);
    }

    React.useEffect(() => { setFilters(props.selectedFilterCriterias ?? []) }, []);

    return (
        <>
            <Panel
                headerText={`Filter By - ${props.filterColumn.name}`}
                onDismiss={props.onDismiss}
                type={PanelType.smallFixedFar}
                isOpen={true}
                isLightDismiss={true}
                onRenderFooterContent={() => (
                    <div className={`${styles.inline} ${styles.left}`}>
                        <DefaultButton
                            text="Apply" iconProps={{ iconName: "Filter" }}
                            onClick={applyFilters}
                            className={styles.filterButton}
                        />
                        <DefaultButton
                            text="Clear" iconProps={{ iconName: "ClearFilter" }}
                            onClick={clearFilters}
                            className={styles.filterButton}
                        />
                    </div>
                )}
            >
                <div>
                    <SearchBox 
                        placeholder={`Search a(n) ${props.filterColumn.name}...`} 
                        onChange={(ev, value:string)=>{handleSearch(value)}}
                        value={searchText}
                    />
                    {
                        props.loading && <Spinner size={SpinnerSize.large} styles={{ root: {margin: '10px auto'}}}/>}
                    {
                        !props.loading && props.possibleFilterCriterias && props.possibleFilterCriterias
                        .filter(criteria => criteria && criteria.match(new RegExp(searchText,'i')))
                        .map(criteria => {

                            const isSelected = filters.indexOf(criteria) > -1;

                            return <Checkbox
                                key={criteria}
                                checked={isSelected}
                                label={criteria || '(empty)'}
                                onChange={(ev, checked) => { handleFilterChanged(criteria, checked) }}
                                className={styles.filterCriteria}
                            />
                        })
                    }
                </div>
            </Panel>
        </>
    );
};