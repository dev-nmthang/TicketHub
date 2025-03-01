/* tslint:disable */
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable dot-notation */
import * as React from "react";
import {
  DefaultButton,
  PrimaryButton,
  Spinner,
  SpinnerSize,
} from "office-ui-fabric-react";
import styles from "./RequestForm.module.scss";
import { IAppContext } from "../../IAppContext";
import { AppContext } from "../../AppDemoWebPart";
import { Status } from "../Status";
import { FormSection, IListFormContext, ListForm, SaveListForm, useListFormContext } from "../../../../common/ListForm";


export interface IRequestFormProps {
  onClose: () => void;
  onOpenEditPanel: (item) => void;
}

export const RequestForm: React.FunctionComponent<IRequestFormProps> = (
  props: React.PropsWithChildren<IRequestFormProps>
) => {
  const { onOpenEditPanel, onClose } = props;
  const { webPartContext } = React.useContext<IAppContext>(AppContext);

  const [loading, setLoading] = React.useState<string>(null);

  const listFormContext: IListFormContext = useListFormContext({
    listName: "Tickets",
    webPartContext: webPartContext,
    itemId: null,
  });

  function init(listFormContext: IListFormContext): void {
    if (listFormContext.isNewForm) {
      listFormContext.formState.setChoice("Status", Status.Draft);
    }
  }

  const handleSaveClick = (): void => {
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
      onSaveSucceeded(item) {
        onClose();
        onOpenEditPanel(item);
      },
    });
  };

  return (
    <>
      {loading && <Spinner label={"Saving"} size={SpinnerSize.large} />}
      <ListForm listFormContext={listFormContext}>
        <FormSection title={""}>
          <div className={styles["FormContainer"]}>
            <div className={styles["FormField"]}>
              <ListForm.Field required fieldInternalName="Title" />
            </div>
            <div className={styles["FormField"]}>
              <ListForm.Field fieldInternalName="Description" />
            </div>
          </div>
        </FormSection>
        <div className={styles["ActionContainer"]}>
          <PrimaryButton text="Next" onClick={handleSaveClick} />
          <DefaultButton text="Close" onClick={onClose} />
        </div>
      </ListForm>
    </>
  );
};
