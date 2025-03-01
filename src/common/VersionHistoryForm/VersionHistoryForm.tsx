/* tslint:disable */
/* eslint-disable */
import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import styles from './VersionHistoryForm.module.scss';
import { sp } from '@pnp/sp/presets/all';
import { SPHttpClient } from '@microsoft/sp-http';

export interface IVersionHistoryFormProps {
  listName: string;
  itemId: number;
  webPartContext: WebPartContext;
}

export const VersionHistoryForm: React.FunctionComponent<IVersionHistoryFormProps> = (props: React.PropsWithChildren<IVersionHistoryFormProps>) => {

  const [versionClassicHtml, setVersionClassicHtml] = React.useState<string>('');


  const init = async () => {

    const list = await sp.web.lists.getByTitle(props.listName).get();

    const url = `${props.webPartContext.pageContext.web.absoluteUrl}/_layouts/versions.aspx?list=${list.Id}&ID=${props.itemId}&IsDlg=1`;

    const response = await props.webPartContext.spHttpClient.get(url, SPHttpClient.configurations.v1);

    const html = await response.text();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const versionTableElement = wrapper.querySelector('#DeltaPlaceHolderMain .ms-settingsframe');

    const anchorElements = versionTableElement.querySelectorAll('a');

    //replace links with plain text
    anchorElements.forEach(anchorElement => {
      anchorElement.replaceWith(document.createTextNode(anchorElement.textContent));
    });

    setVersionClassicHtml(versionTableElement.outerHTML);
  }

  React.useEffect(() => { init(); }, []);

  return (
    <div className={styles.HistoryForm}>

      <div dangerouslySetInnerHTML={{ __html: versionClassicHtml }}></div>

    </div>
  );
};