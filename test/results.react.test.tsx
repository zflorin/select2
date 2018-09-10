import * as React from "react";
import {Results} from "../src/results";
import {ReactWrapper, shallow, ShallowWrapper} from "enzyme";
import toJson from "enzyme-to-json";
import {makeQuery, waitForState} from "./utils";
import {dictionary} from "../src/dictionary";


test("No Results", async () => {
    let component = shallow(
        <Results
            showNoSearchResultsFound={true}

            search={"test"}
            minimumCharacters={3}
            searchResults={undefined}
            searchResultDomId={(index)=>"result-"+index}
            searchHasMoreResults={false}
            activeSearchResult={undefined}
            searchResultsLoading={false}
            showLoadMoreResults={false}
            showMinimumCharactersError={false}
            listboxDomId={"listbox"}
            itemLabel={undefined}
            resultContent={undefined}
            dictionary={dictionary()}
            onLoadMore={undefined}
            onActivateSearchResult={undefined}
            onSelectSearchResult={undefined}
        />);

    expect(toJson(component)).toMatchSnapshot();
});

test("Minimum Characters For Search", async ()=> {

    let component = shallow(
        <Results
            search={""}
            minimumCharacters={2}
            showMinimumCharactersError={true}

            showNoSearchResultsFound={false}
            searchResults={undefined}
            searchResultDomId={(index)=>"result-"+index}
            searchHasMoreResults={false}
            activeSearchResult={undefined}
            searchResultsLoading={false}
            showLoadMoreResults={false}
            listboxDomId={"listbox"}
            itemLabel={undefined}
            resultContent={undefined}
            dictionary={dictionary()}
            onLoadMore={undefined}
            onActivateSearchResult={undefined}
            onSelectSearchResult={undefined}
        />);

    expect(toJson(component)).toMatchSnapshot("enter two more");

    component = shallow(
        <Results
            search={"t"}
            minimumCharacters={2}
            showMinimumCharactersError={true}

            showNoSearchResultsFound={false}
            searchResults={undefined}
            searchResultDomId={(index)=>"result-"+index}
            searchHasMoreResults={false}
            activeSearchResult={undefined}
            searchResultsLoading={false}
            showLoadMoreResults={false}
            listboxDomId={"listbox"}
            itemLabel={undefined}
            resultContent={undefined}
            dictionary={dictionary()}
            onLoadMore={undefined}
            onActivateSearchResult={undefined}
            onSelectSearchResult={undefined}
        />);

    expect(toJson(component)).toMatchSnapshot("enter one more");

    component = shallow(
        <Results
            search={"te"}
            minimumCharacters={2}
            showMinimumCharactersError={false}

            showNoSearchResultsFound={false}
            searchResults={[{id:1,text:"item-1"},{id:2,text:"item-2"}]}
            searchResultDomId={(index)=>"result-"+index}
            searchHasMoreResults={false}
            activeSearchResult={undefined}
            searchResultsLoading={false}
            showLoadMoreResults={false}
            listboxDomId={"listbox"}
            itemLabel={(i)=>i.text}
            resultContent={(i)=>i.text}
            dictionary={dictionary()}
            onLoadMore={undefined}
            onActivateSearchResult={undefined}
            onSelectSearchResult={undefined}
        />);

    expect(toJson(component)).toMatchSnapshot("results");

});
