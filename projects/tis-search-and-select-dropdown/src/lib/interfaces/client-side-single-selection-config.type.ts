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

interface ClassCondition {
    key: string | number | null,
    class: string | null,
    value: string | null,
    isTranslation: boolean | null,
}

interface Badge {
    key: string | null,
    classConditionList: ClassCondition[] | null,
}

export interface ClientSideSingleSelectionConfig {
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
    filterNameKeys?: string[] | null,
    dataValueKey: string | null,
    badge: Badge | null,
}