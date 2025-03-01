/* eslint-disable @microsoft/spfx/no-async-await */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-bind */

import * as React from "react";
import { statusColorConfiguration } from "./Status";
import {
  IButtonStyles,
  IconButton,
  Panel,
  PanelType,
  Pivot,
  PivotItem,
  PrimaryButton,
} from "office-ui-fabric-react";
import * as CamlBuilder from "camljs";
import { RequestForm } from "./RequestForm/RequestForm";
import { AppContext } from "../AppDemoWebPart";
import { IAppContext } from "../IAppContext";
import { EditForm } from "./EditForm/EditForm";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-groups";
import "@pnp/sp/site-users";
import "@pnp/sp/site-users";
import {
  IListviewColumn,
  ListView,
  ListViewService,
} from "../../../common/ListView";
import { ConfirmDialog, IConfirmOptions } from "../../../common/ConfirmDialog";
import { StatusBadge } from "../../../common/StatusBadge";

export interface IAppProps {}

const enum FilterSet {
  All = "1",
  My = "2",
}

export const App: React.FunctionComponent<IAppProps> = (
  props: React.PropsWithChildren<IAppProps>
) => {
  const { webPartContext } = React.useContext<IAppContext>(AppContext);

  const [selectedFilterSet, setSelectedFilterSet] = React.useState<FilterSet>(
    FilterSet.All
  );
  const [listViewService, setListViewService] =
    React.useState<ListViewService>(null);
  const [newItem, setNewItem] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [confirm, setConfirm] = React.useState<IConfirmOptions>(null);

  const setupListViewService = (): void => {
    const conditions: CamlBuilder.IExpression[] = [];

    switch (selectedFilterSet) {
      case FilterSet.All:
        break;
      case FilterSet.My:
        const expression1 = CamlBuilder.Expression()
          .UserField("Author")
          .EqualToCurrentUser();
        conditions.push(expression1);
        break;
    }

    const caml: string = new CamlBuilder()
      .View()
      .Query()
      .Where()
      .All(conditions)
      .ToString();

    setListViewService(
      new ListViewService({ listName: "Tickets", camlQuery: caml })
    );
  };

  React.useEffect(() => {
    setupListViewService();
  }, [selectedFilterSet]);

  const handleNewItemClick = (): void => {
    setNewItem(true);
  };

  const handleClosePanel = (): void => {
    setNewItem(false);
  };

  const handleEditClick = (item): void => {
    setSelectedItem(item);
  };

  const handleDeleteClick = (itemId: number): void => {
    const confirmOptions: IConfirmOptions = {
      message: "Are you sure to delete the Item?",
      title: "Confirm delete!",
      commentType: "none",
      onConfirm: async () => {
        await sp.web.lists
          .getByTitle("Tickets")
          .items.getById(itemId)
          .recycle();
        listViewService.forceRefresh();
      },
    };

    setConfirm(confirmOptions);
  };

  const renderActionButtons = (item: any): React.ReactElement => {
    const buttonStyle: IButtonStyles = { root: { height: 20 } };

    return (
      <div>
        <IconButton
          styles={buttonStyle}
          iconProps={{ iconName: "WindowEdit" }}
          title="Edit"
          disabled={false}
          onClick={() => handleEditClick(item)}
        />
        <IconButton
          styles={buttonStyle}
          iconProps={{ iconName: "Delete" }}
          title="Delete"
          disabled={false}
          onClick={() => handleDeleteClick(item.ID)}
        />
      </div>
    );
  };

  const columns: IListviewColumn[] = [
    {
      detailsListColumn: {
        name: "Action",
        onRender: renderActionButtons,
        minWidth: 60,
        maxWidth: 60,
      },
    },
    { fieldName: "Title" },
    {
      fieldName: "Status",
      detailsListColumn: {
        minWidth: 170,
        maxWidth: 170,
        onRender: (item) => (
          <StatusBadge
            status={item.Status}
            bordered
            colors={statusColorConfiguration}
          />
        ),
      },
    },
    { fieldName: "Author" },
  ];

  const handlePivotClick = (item: PivotItem, ev: React.MouseEvent): void => {
    setSelectedFilterSet(item.props.itemKey as FilterSet);
  };

  const handleOpenEditPanel = (item): void => {
    setSelectedItem(item);
  };

  const handleCloseEditPanel = (): void => {
    setSelectedItem(null);
  };

  return (
    <>
      <div>
        <PrimaryButton text="New" onClick={handleNewItemClick} />
      </div>

      <Pivot onLinkClick={handlePivotClick} selectedKey={selectedFilterSet}>
        <PivotItem headerText="All Tickets" itemKey={FilterSet.All} />
        <PivotItem headerText="My Tickets" itemKey={FilterSet.My} />
      </Pivot>

      <Panel
        headerText="Add New Ticket"
        onDismiss={handleClosePanel}
        isOpen={newItem}
        type={PanelType.medium}
      >
        <RequestForm
          onClose={() => {
            listViewService.forceRefresh();
            handleClosePanel();
          }}
          onOpenEditPanel={handleOpenEditPanel}
        />
      </Panel>

      <Panel
        headerText={"Edit Ticket: " + selectedItem?.ID}
        onDismiss={handleCloseEditPanel}
        isOpen={selectedItem}
        type={PanelType.medium}
      >
        <EditForm
          selectedItem={selectedItem}
          onClose={() => {
            listViewService.forceRefresh();
            handleCloseEditPanel();
          }}
        />
      </Panel>

      <ListView
        listViewService={listViewService}
        columns={columns}
        context={webPartContext}
      />

      <ConfirmDialog
        onDismiss={() => {
          setConfirm(null);
        }}
        confirmOptions={confirm}
      />
    </>
  );
};
