/* tslint:disable */
/* eslint-disable */
import {
  Dropdown,
  Icon,
  IDropdownOption,
  IDropdownStyles,
} from "office-ui-fabric-react";
import * as React from "react";
import styles from "./Pager.module.scss";

interface IPagerProps {
  items: any[];
  numberOfItemsPerPage: number;
  layout?:
  | "full"
  | "hide go to page label"
  | "chevrons only"
  | "hide chevrons"
  | "hide chevrons and go to page label"
  | "go to page label and dropdown only"
  | "dropdown only";
  children: (items: any[]) => React.ReactNode
}

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: "max-content" },
};

export const Pager: React.FunctionComponent<IPagerProps> = (props: IPagerProps) => {
  const [itemsOnPage, setItemsOnPage] = React.useState<any[]>([]);
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1);
  const [firstItem, setFirstItem] = React.useState<number>(0);
  const [lastItem, setLastItem] = React.useState<number>(0);
  const [hasPreviousPage, setHasPreviousPage] = React.useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(false);
  const [allPages, setAllPages] = React.useState<IDropdownOption[]>([]);
  const [showParts, setShowParts] = React.useState<Record<string, boolean>>({
    label: true,
    dropdown: true,
    chevrons: true,
    displayedItems: true,
  });

  React.useEffect(() => {
    if (props.layout) {
      switch (props.layout) {
        case "full":
          setShowParts({
            label: true,
            dropdown: true,
            chevrons: true,
            displayedItems: true,
          });
          break;
        case "hide go to page label":
          setShowParts({
            label: false,
            dropdown: true,
            chevrons: true,
            displayedItems: true,
          });
          break;
        case "chevrons only":
          setShowParts({
            label: false,
            dropdown: false,
            chevrons: true,
            displayedItems: true,
          });
          break;
        case "hide chevrons":
          setShowParts({
            label: true,
            dropdown: true,
            chevrons: false,
            displayedItems: true,
          });
          break;
        case "hide chevrons and go to page label":
          setShowParts({
            label: false,
            dropdown: true,
            chevrons: false,
            displayedItems: true,
          });
          break;
        case "go to page label and dropdown only":
          setShowParts({
            label: true,
            dropdown: true,
            chevrons: false,
            displayedItems: false,
          });
          break;
        case "dropdown only":
          setShowParts({
            label: false,
            dropdown: true,
            chevrons: false,
            displayedItems: false,
          });
          break;
      }
    }
  }, [props.layout]);

  const configurePaging = () => {
    const totalPages = Math.ceil(
      props.items.length / props.numberOfItemsPerPage
    );
    if (totalPages === 0) {
      return;
    }

    const allPagesDropDownOptions: IDropdownOption[] = [];
    for (let i = 1; i <= totalPages; i++) {
      allPagesDropDownOptions.push({
        key: i, text: i.toString()
      });
    }
    setAllPages(allPagesDropDownOptions);

    if (currentPageNumber > totalPages) {
      setCurrentPageNumber(totalPages);
      return;
    }

    setHasPreviousPage(currentPageNumber > 1);
    setHasNextPage(currentPageNumber < totalPages);

    const firstItem = (currentPageNumber - 1) * props.numberOfItemsPerPage;
    setFirstItem(firstItem);

    const lastItem = Math.min(
      firstItem + props.numberOfItemsPerPage,
      props.items.length
    );
    setLastItem(lastItem);
    const filteredItems = props.items.slice(firstItem, lastItem);

    setItemsOnPage(filteredItems);
  };

  React.useEffect(() => {
    configurePaging();
  }, [currentPageNumber, props.items, props.numberOfItemsPerPage]);

  const goToPrevious = () => {
    if (hasPreviousPage) {
      setCurrentPageNumber(currentPageNumber - 1);
    }
  };
  const goToNext = () => {
    if (hasNextPage) {
      setCurrentPageNumber(currentPageNumber + 1);
    }
  };

  const handleDropdownChange = (
    event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption
  ) => {
    let pageNumber = item.key;
    if (typeof pageNumber === "string") {
      pageNumber = parseInt(pageNumber);
    }
    setCurrentPageNumber(pageNumber);
  };

  return (
    <>
      <div>
        {props.children(itemsOnPage)}
      </div>
      {props.items.length > 0 && (
        <>
          <div className={styles.paginationContainer}>
            {showParts.label && (
              <span className={styles.goToPageText}>Go to page:</span>
            )}
            {showParts.dropdown && (
              <div className={styles.dropdown}>
                <Dropdown
                  options={allPages}
                  styles={dropdownStyles}
                  onChange={handleDropdownChange}
                  selectedKey={currentPageNumber}
                />
              </div>
            )}
            {showParts.chevrons && (
              <span
                onClick={goToPrevious}
                className={`${styles.chevron} ${hasPreviousPage ? "" : styles.inactive
                  }`}
              >
                <Icon iconName="ChevronLeft" />
              </span>
            )}
            {showParts.displayedItems && (
              <div className={styles.displayedItemsText}>
                {firstItem + 1}-{lastItem} of {props.items.length}
              </div>
            )}
            {showParts.chevrons && (
              <span
                onClick={goToNext}
                className={`${styles.chevron} ${hasNextPage ? "" : styles.inactive
                  }`}
              >
                <Icon iconName="ChevronRight" />
              </span>
            )}
          </div>
        </>
      )}
    </>
  );
};
