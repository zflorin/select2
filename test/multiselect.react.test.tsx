import * as React from "react";
import {MultiSelect} from "../src/select2";
import {ReactWrapper, shallow, ShallowWrapper} from "enzyme";
import toJson from "enzyme-to-json";
import {makeQuery, waitForState} from "./utils";


async function search(component: ShallowWrapper | ReactWrapper, text: string) {
    component.find("input.s25Search").simulate("change", {target: {value: text}});
    await waitForState(component, (state) => {
        return state.searchResultsLoading===false;
    });
}


test("Initial Render", () => {
    let component = shallow(
        <MultiSelect
            name="test"
            values={[]}
            itemId="id"
            itemLabel="text"
            valuesLabel="Values Label"
            searchLabel="Search Label"
            query={makeQuery(0)}
        />);

    expect(toJson(component)).toMatchSnapshot();

});

test("No Results", async () => {
    let component = shallow(
        <MultiSelect
            name="test"
            values={[]}
            itemId="id"
            itemLabel="text"
            valuesLabel="Values Label"
            searchLabel="Search Label"
            query={makeQuery(0)}
        />);

    await search(component, "abc");

    expect(toJson(component)).toMatchSnapshot();
});

test("Minimum Characters For Search", async ()=> {

    let component = shallow(
        <MultiSelect
            name="test"
            values={[]}
            itemId="id"
            itemLabel="text"
            valuesLabel="Values Label"
            searchLabel="Search Label"
            query={makeQuery(1)}
            minimumCharacters={3}
        />);

    await search(component, "a");
    expect(toJson(component)).toMatchSnapshot("enter two more");

    await search(component, "ab");
    expect(toJson(component)).toMatchSnapshot("enter one more");

    await search(component, "abc");
    expect(toJson(component)).toMatchSnapshot("results");

});
