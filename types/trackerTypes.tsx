export type MarkedDates = {
    [date: string]: {
        selected?: boolean;
        marked?: boolean;
        dotColor?: string;
        selectedColor?: string;
        selectedTextColor?: string;
    };
}

export type EntryStatus = {
    status: boolean;
    entryId: string | null;
    date: string | null;
}

export type TrackerData = {
    name: string;
    description?: string;
    createdAt: string;
    id: string;
    userId: string;
}