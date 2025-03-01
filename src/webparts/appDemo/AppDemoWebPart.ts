import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "AppDemoWebPartStrings";
import { setup as pnpSetup } from "@pnp/common";
import { App } from "./components/App";
import { IAppContext } from "./IAppContext";

export interface IAppDemoWebPartProps {
  description: string;
}

export const AppContext: React.Context<IAppContext> =
  React.createContext<IAppContext>(null);

export default class AppDemoWebPart extends BaseClientSideWebPart<IAppDemoWebPartProps> {
  public render(): void {
    const element: React.ReactElement = React.createElement(
      AppContext.Provider,
      {
        value: {
          webPartContext: this.context,
          currentUser: this.context.pageContext.user,
        },
      },
      React.createElement(App)
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return super.onInit().then(() => {
      pnpSetup({
        spfxContext: this.context,
        currentUser: this.context.pageContext.user,
      });
    });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
