/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @microsoft/spfx/no-async-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable dot-notation */
/* eslint-disable react/jsx-no-bind */
import * as React from "react";
import { AppContext } from "../../AppDemoWebPart";
import { IAppContext } from "../../IAppContext";
import {
  DefaultButton,
  PrimaryButton,
  Spinner,
  SpinnerSize,
} from "office-ui-fabric-react";
import styles from "./EditForm.module.scss";
import { ImprovementList } from "../ImprovementList/ImprovementList";
import { Status } from "../Status";
import { FormSection, IListFormContext, ListForm, SaveListForm, useListFormContext } from "../../../../common/ListForm";
import ListFormGrid from "../../../../common/ListForm/ListFormGrid.module.scss";
import { CascadingLookup } from "../../../../common/ListForm/CustomFieldRendering";

export interface IEditFormProps {
  onClose: () => void;
  selectedItem: any;
}

export const EditForm: React.FunctionComponent<IEditFormProps> = (
  props: React.PropsWithChildren<IEditFormProps>
) => {
  const { selectedItem, onClose } = props;
  const { webPartContext } = React.useContext<IAppContext>(AppContext);

  const [loading, setLoading] = React.useState<string>(null);

  const listFormContext: IListFormContext = useListFormContext({
    listName: "Tickets",
    webPartContext: webPartContext,
    itemId: selectedItem?.ID || null,
  });

  const handleSaveClick = async (status: Status): Promise<void> => {
    SaveListForm({
      listFormContext: listFormContext,
      onLoadingChanged(visible: boolean) {
        setLoading(visible ? "Saving..." : null);
      },
      async getListItemUpdates(item) {
        item.Status = status;
        return item;
      },
      async onSaveListItem(item) {
        const listItem = await listFormContext.saveListItem(item);
        return listItem;
      },
      onSaveSucceeded() {
        onClose();
      },
    });
  };

  return (
    <>
      {loading && <Spinner label={"Saving"} size={SpinnerSize.large} />}
      <ListForm listFormContext={listFormContext}>
        <FormSection title="">
          <div className={`${ListFormGrid.grid} ${ListFormGrid.columns3}`}>
            <div className={ListFormGrid.colspan1}>
              <ListForm.Field disabled fieldInternalName="Created" />
            </div>
            <div className={ListFormGrid.colspan1}>
              <ListForm.Field disabled fieldInternalName="Author" />
            </div>
            <div className={ListFormGrid.colspan1}>
              <ListForm.Field disabled fieldInternalName="Status" />
            </div>
          </div>
        </FormSection>

        <FormSection title="General">
          <div className={`${ListFormGrid.grid} ${ListFormGrid.columns4}`}>
            <div className={ListFormGrid.colspan4}>
              <ListForm.Field disabled fieldInternalName="Title" />
            </div>
            <div className={ListFormGrid.colspan4}>
              <ListForm.Field disabled fieldInternalName="Description" />
            </div>
            <div className={ListFormGrid.colspan2}>
              <ListForm.Field fieldInternalName="HasColor" />
            </div>
            <div className={ListFormGrid.colspan2}>
              <ListForm.Field
                disabled={!listFormContext.formState.getBoolean("HasColor")}
                fieldInternalName="Colors"
              />
            </div>
            <div className={ListFormGrid.colspan2}>
              <ListForm.Field fieldInternalName="ProductCategory" />
            </div>
            <div className={ListFormGrid.colspan2}>
              <ListForm.Field
                fieldInternalName="Product"
                onRenderControl={(props) => (
                  <CascadingLookup
                    lookupListName="Product"
                    dependencyFieldName="ProductCategory"
                    lookupListRelatedFieldName="Category"
                    {...props}
                  />
                )}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Improvements">
          <ImprovementList ticketId={selectedItem?.ID} />
        </FormSection>

        <div className={styles["ActionContainer"]}>
          <PrimaryButton
            text="Submit"
            onClick={() => handleSaveClick(Status.Submitted)}
          />
          <DefaultButton
            className={styles["SaveButton"]}
            text="Save"
            onClick={() => handleSaveClick(Status.Draft)}
          />
          <DefaultButton text="Cancel" onClick={onClose} />
        </div>
      </ListForm>
    </>
  );
};
