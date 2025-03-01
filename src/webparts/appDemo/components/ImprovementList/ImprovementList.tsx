/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @microsoft/spfx/no-async-await */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/typedef */

import * as React from "react";
import { IAppContext } from "../../IAppContext";
import { AppContext } from "../../AppDemoWebPart";
import {
  IButtonStyles,
  IconButton,
  Panel,
  PanelType,
  PrimaryButton,
} from "office-ui-fabric-react";
import * as CamlBuilder from "camljs";
import { ImprovementForm } from "../ImprovementForm/ImprovementForm";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-groups";
import "@pnp/sp/site-users";
import "@pnp/sp/site-users";
import { IListviewColumn, ListView, ListViewService } from "../../../../common/ListView";
import { ConfirmDialog, IConfirmOptions } from "../../../../common/ConfirmDialog";


export interface IImprovementListProps {
  ticketId: number;
}

export const ImprovementList: React.FunctionComponent<IImprovementListProps> = (
  props: React.PropsWithChildren<IImprovementListProps>
) => {
  const { ticketId } = props;
  const { webPartContext } = React.useContext<IAppContext>(AppContext);
  const [listViewService, setListViewService] =
    React.useState<ListViewService>(null);
  const [newRequest, setNewRequest] = React.useState(false);
  const [editItemId, setEditItemId] = React.useState<number>(null);
  const [confirm, setConfirm] = React.useState<IConfirmOptions>(null);

  const setupListViewService = (): void => {
    const conditions: CamlBuilder.IExpression[] = [];
    const expression = CamlBuilder.Expression()
      .LookupField("RelatedTicket")
      .Id()
      .EqualTo(ticketId);
    conditions.push(expression);

    const caml: string = new CamlBuilder()
      .View()
      .Query()
      .Where()
      .All(conditions)
      .ToString();

    setListViewService(
      new ListViewService({ listName: "Improvements", camlQuery: caml })
    );
  };

  React.useEffect(() => {
    setupListViewService();
  }, []);

  const handleDeleteClick = (itemId: number): void => {
    const confirmOptions: IConfirmOptions = {
      message: "Are you sure to delete this request?",
      title: "Confirm delete!",
      commentType: "none",
      onConfirm: async () => {
        await sp.web.lists
          .getByTitle("Improvements")
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
          onClick={() => setEditItemId(item.ID)}
          disabled={false}
        />
        <IconButton
          styles={buttonStyle}
          iconProps={{ iconName: "Delete" }}
          title="Delete"
          onClick={() => handleDeleteClick(item.ID)}
          disabled={false}
        />
      </div>
    );
  };

  const handleClosePanel = (): void => {
    setNewRequest(false);
    setEditItemId(null);
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
      fieldName: "Description",
      detailsListColumn: {
        name: "Improvement Description",
      },
    },
  ];

  const handleNewItemClick = (): void => {
    setNewRequest(true);
  };

  return (
    <>
      <div>
        <PrimaryButton text="New" onClick={handleNewItemClick} />
      </div>

      <Panel
        headerText={
          newRequest
            ? "New Improvement Request"
            : `Edit Improvement Request (ID: ${editItemId})`
        }
        onDismiss={handleClosePanel}
        isOpen={!!editItemId || newRequest}
        type={PanelType.medium}
      >
        <ImprovementForm
          itemId={editItemId}
          ticketId={ticketId}
          onClose={() => {
            listViewService.forceRefresh();
            handleClosePanel();
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
