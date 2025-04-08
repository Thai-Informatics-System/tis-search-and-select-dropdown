interface Hint {
    label: string | null,
    color: string | null,
    msg: string,
}

interface CreateNew {
    label: string,
    color: string | null,
    url?: string,
    clickBtn?: any,
}

interface AdditionalName {
    keys: string[] | null,
    separators: string[] | null,
}

export interface ClientSideMultipleSelectionConfig {
    uri: string | null,
    method: string | null,
    limit: number | null,
    setFirstOption: boolean | null,
    ifLengthOnlyOne: boolean | null,
    filter: object | null,
    isAllOption: boolean,
    isSearchable: boolean,
    isEnableRefreshMode: boolean,
    clickRefreshBtn?: any,
    hint: Hint | null,
    createNew: CreateNew | null,
    noEntriesFoundLabel: string | null,
    additionalName: AdditionalName | null,
    dataValueKey: string | null,
}