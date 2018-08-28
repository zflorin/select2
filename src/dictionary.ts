export interface Dictionary {
    valueAdded: (itemLabel: string) => string;

    noSearchResults: () => string;
    searchResultsLoading: () => string;
    removeButtonTitle: () => string;
    minimumCharactersMessage: (len: number, min: number) => string;
}

class AmericanEnglishDictionary implements Dictionary {

    noSearchResults() {
        return "No results available";
    }

    searchResultsLoading() {
        return "Loading...";
    }

    removeButtonTitle() {
        return "Remove selected values";
    }

    valueAdded(itemLabel: string) {
        return itemLabel + " added";
    }

    minimumCharactersMessage(len: number, min: number) {
        const delta = min - len;
        return "Please enter " + delta + " more character" + (delta > 1 ? "s" : "");
    }
}

const dictionaries = new Map<string, Dictionary>();
dictionaries.set("en_us", new AmericanEnglishDictionary());

export function dictionary(dict: Dictionary | string): Dictionary {
    const fallback = dictionaries.get("en_us");

    if (!dict) {
        return fallback;
    }

    if (typeof dict == "string") {
        const instance = dictionaries.get(dict);
        return instance ? instance : fallback;
    } else {
        return dict;
    }
}
