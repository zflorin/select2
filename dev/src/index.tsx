import * as React from "react";
import * as ReactDOM from "react-dom";

import countries from "./countries";
import * as select2 from "../../src/select2";
import {MultiSelect} from "../../src/select2";

type Country = { code: string, name: string };

const query = (function () {
    let previousTimeout: number = undefined;
    let previousReject: (reason: any) => any = undefined;

    return function (search: string, page: number) {
        if (previousReject != undefined) {
            previousReject(new Error("cancelled"));
            window.clearTimeout(previousTimeout);
        }
        const delay = 100;

        return new Promise<select2.QueryResult<Country>>((resolve: any, reject: any) => {
            previousReject = reject;
            previousTimeout = window.setTimeout(function () {
                const results: Country[] = [];
                let count = 0;
                let limit = 5;
                let offset = page * limit;
                for (let i = 0; i < countries.length; i++) {
                    const country = countries[i];
                    if (country.name.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
                        if (count >= offset) {
                            results.push(country);
                        }
                        count++;
                        if (count > offset + limit) {
                            break;
                        }
                    }
                }
                previousTimeout = undefined;
                previousReject = undefined;
                resolve({values: results, more: results.length == limit})
            }, delay);
        });
    }
})();

ReactDOM.render(
    <MultiSelect
        name="countries"
        values={countries.splice(0, 3)}
        itemId="code"
        itemLabel={(c) => c.name}
        valueContent={(item)=><div style={{color:"green"}}>{item.name}</div>}
        resultContent={(item)=><div style={{color:"blue"}}>{item.name}</div>}
        valuesLabel="Countries"
        searchLabel="Add Country"
        query={query}
        minimumCharacters={2}
    />
    , document.getElementById("multi1")
);

ReactDOM.render(
    <MultiSelect
        name="countries2"
        values={countries.splice(0, 2)}
        itemId={(c) => c.code}
        itemLabel={(c) => c.name}
        valueContent={(c) => c.name}

        valuesLabel="Countries"
        searchLabel="Add Country"
        query={query}

        openOnSearchFocus={false}
    />
    , document.getElementById("multi2")
);
