/* tslint:disable */
/* eslint-disable */
export const getFirstNameLastName = (title: string) => {
    const array = title.split(',');
    const firstName = array[1];
    const lastName = array[0];
    return (firstName && lastName) ? `${firstName} ${lastName}` : title;
}

export const formatIsoDate = (isodatestring: string) => {
    return isodatestring ? (new Date(isodatestring)).toLocaleDateString() : '';
}

/**
 * Retrieves an itemid from the querystring parameters
 * @param queryStringParamName optional parameter. default '?OpenItem=<id>'
 * @returns itemId to open
 */
export const manageOpenWithQueryString = (queryStringParamName: string = 'OpenItem'): number => {
    const itemId = getParamValue(queryStringParamName);
    const openItemId = (isFinite(itemId) ? itemId : null);
    if (openItemId) {
        setHistoryState();
        return openItemId;
    }
}

const getParamValue = (paramName: string) => {
    const urlSearchParams = new URLSearchParams(location.search);
    const stringId = urlSearchParams.get(paramName);
    return parseInt(stringId);
}

const setHistoryState = () => {
    const urlWithoutParam = location.href.split('?')[0];
    return history.pushState(null, null, urlWithoutParam);
}