export interface ITermData {
    id: string;
    isDeprecated?: boolean;
    childrenCount?: number;
    createdDateTime?: string;
    lastModifiedDateTime?: string;
    labels: {
        name: string;
        isDefault: boolean;
        languageTag: string;
    }[];
    descriptions?: {
        description: string;
        languageTag: string;
    }[];
    isAvailableForTagging?: {
        setId: string;
        isAvailable: boolean;
    }[];

}