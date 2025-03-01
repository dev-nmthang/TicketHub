/* eslint-disable react/jsx-no-bind */
/* eslint-disable @microsoft/spfx/no-async-await */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/typedef */
import {
  DefaultButton,
  PrimaryButton,
  Spinner,
  SpinnerSize,
} from "office-ui-fabric-react";
import * as React from "react";
import { AppContext } from "../../AppDemoWebPart";
import { IAppContext } from "../../IAppContext";
import styles from "./ImprovementForm.module.scss";
import { IListFormContext, ListForm, SaveListForm, useListFormContext } from "../../../../common/ListForm";


export interface IImprovementFormProps {
  onClose: () => void;
  itemId?: number;
  ticketId: number;
}

export const ImprovementForm: React.FunctionComponent<
  IImprovementFormProps
> = ({ onClose, itemId = null, ticketId }: IImprovementFormProps) => {
  const { webPartContext } = React.useContext<IAppContext>(AppContext);

  const [loading, setLoading] = React.useState("");

  const listFormContext = useListFormContext({
    itemId: itemId,
    listName: "Improvements",
    webPartContext: webPartContext,
    onInit: init,
  });

  async function init(listFormContext: IListFormContext) {
    listFormContext.formState.setLookup("RelatedTicket", { Id: ticketId });
  }

  const handleSubmitClick = () => {
    SaveListForm({
      listFormContext: listFormContext,
      onLoadingChanged(visible: boolean) {
        setLoading(visible ? "Saving..." : null);
      },
      onValidate(listItem) {
        listFormContext.validation.clearErrorMessages();
        const invalid: boolean = !listItem.Title;
        if (!listItem.Title)
          listFormContext.validation.setErrorMessage(
            "Title",
            "You can't leave this blank."
          );
        return !invalid;
      },
      getListItemUpdates() {
        return {};
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
        <ListForm.Field required fieldInternalName="Title" />
        <ListForm.Field fieldInternalName="Description" />

        <div className={styles.ActionContainer}>
          <PrimaryButton text="Submit" onClick={handleSubmitClick} />
          <DefaultButton text="Close" onClick={onClose} />
        </div>
      </ListForm>
    </>
  );
};
