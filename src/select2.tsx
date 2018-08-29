import * as React from "react";
import {CSSProperties} from "react";
import * as style from "./select2.scss";
import * as classNames from "classnames/bind";
import * as announce from "./announce";
import * as util from "./util";
import {Key, scope, uuid} from "./util";
import {Dropdown} from "./dropdown";
import {Dictionary, dictionary} from "./dictionary";

let cn = classNames.bind(style);

export interface QueryResult<T> {
    values: T[],
    more: boolean,
}

interface MultiSelectProps<T> {
    name: string;
    values: T[];

    itemId: ((item: T) => string) | (keyof T);
    itemLabel: ((item: T) => string) | (keyof T);
    valueContent: ((item: T) => (string | React.ReactChild)) | (keyof T);
    resultContent?: ((item: T) => (string | React.ReactChild)) | (keyof T);

    valuesLabel: (() => string) | string;
    searchLabel: (() => string) | string;

    query: (search: string, page: number) => Promise<QueryResult<T>>;

    /*todo or react node*/
    style?: CSSProperties;

    // callbacks

    onValuesChanged?: (values: T[], oldValues: T[]) => void;
    onValueRemoved?: (value: T, newValues: T[], oldValues: T[]) => void;

    // optional

    dictionary: Dictionary | string;
    openOnSearchFocus: boolean;
    minimumCharacters: number;

}

interface MultiSelectState<T> {
    focused: boolean;
    open: boolean;

    values: T[];
    activeValue: number;
    selectedValues: number[];

    search: string;
    searchPage: number;
    searchResults: T[] | undefined;
    searchResultDomIds: number[] | undefined;
    searchResultsLoading: boolean;
    searchHasMoreResults: boolean;
    activeSearchResult: number;
    showNoSearchResultsFound: boolean;
    showLoadMoreResults: boolean;
    showMinimumCharactersError: boolean;
}


export class MultiSelect<T> extends React.PureComponent<MultiSelectProps<T>, MultiSelectState<T>> {

    static defaultProps = {
        dictionary: "en_us",
        openOnSearchFocus: true,
        minimumCharacters: 0
    }


    id: string;

    searchRef: React.RefObject<HTMLInputElement>;
    controlRef: React.RefObject<any>;
    valuesRef: React.RefObject<HTMLDivElement>;
    dropdownRef: React.RefObject<HTMLDivElement>;
    loadingMoreResults: React.RefObject<HTMLDivElement>;
    lastMouseClientX: number;
    lastMouseClientY: number;

    searchFocussedPragmatically: boolean;
    toggleWasOpen: boolean;

    constructor(props: MultiSelectProps<T>) {
        super(props);
        this.id = "s2-multi-" + uuid();
        this.controlRef = React.createRef();
        this.dropdownRef = React.createRef();
        this.valuesRef = React.createRef();
        this.searchRef = React.createRef();
        this.loadingMoreResults = React.createRef();
        this.searchFocussedPragmatically = false;

        this.state = ({
            focused: false,
            open: false,

            values: props.values,
            activeValue: -1,
            selectedValues: [],

            search: "",
            searchPage: 0,
            searchResults: undefined,
            searchResultDomIds: undefined,
            searchHasMoreResults: false,
            activeSearchResult: -1,
            showNoSearchResultsFound: false,
            searchResultsLoading: false,
            showLoadMoreResults: false,
            showMinimumCharactersError: false
        });
    }

    componentWillMount() {
        announce.initialize();
    }

    componentDidUpdate(prevProps: MultiSelectProps<T>, prevState: MultiSelectState<T>) {

        if (prevState.activeSearchResult != this.state.activeSearchResult) {

            if (this.state.activeSearchResult >= 0
                && this.state.searchResults.length > 0
                && this.state.activeSearchResult == (this.state.searchResults.length - 1)
                && this.state.showLoadMoreResults) {
                // last result is selected and load more is shown, make sure it is scrolled into view

                const drop = this.dropdownRef.current;
                const el = this.loadingMoreResults.current;

                drop.scrollTop = el.offsetTop + el.offsetHeight - drop.clientHeight;


                //console.log("scrolling to see load more");//, setting scrolltop", drop, el, el.offsetTop - drop.clientHeight);


            } else if (this.state.activeSearchResult >= 0) {
                // make sure it is scrolled into view
                const id = this.getSearchResultDomId(this.state.activeSearchResult);
                const el = document.getElementById(id);
                if (el != null) {
                    const drop = this.dropdownRef.current;

                    const c = drop.getBoundingClientRect();
                    const e = el.getBoundingClientRect();

                    if (e.top < c.top && e.bottom <= c.bottom) {
                        const delta = c.top - e.top;
                        drop.scrollTop = drop.scrollTop - delta;
                        //console.log("scrolling into view top");
                    }

                    if (e.top >= c.top && e.bottom > c.bottom) {
                        const delta = e.bottom - c.bottom;
                        drop.scrollTop = drop.scrollTop + delta;
                        //console.log("scrolling into view bottom");
                    }

                }
            }
        }
    }

    render() {
        const props = this.props;
        const dict = dictionary(props.dictionary);
        const state = this.state;
        const searchId = this.getSearchDomId();
        const dropdownId = this.getDropdownDomId();
        const valuesLabel = typeof(props.valuesLabel) === "function" ? props.valuesLabel() : props.valuesLabel;
        const searchLabel = typeof(props.searchLabel) === "function" ? props.searchLabel() : props.searchLabel;
        return (
            <div ref={this.controlRef} id={this.id} style={props.style} className={
                cn(style.s25Multi, style.s25Control, {
                    s25SearchResultsLoading: state.searchResultsLoading,
                    s25Focused: state.focused,
                    s25Open: state.open,
                })}>
                <div className={style.s25Body}>
                    {state.values.map((value, index) => {
                        return <input key={index} type="hidden" name={props.name} value={this.getItemId(value)}/>
                    })
                    }
                    {state.values.length > 0 &&
                    <React.Fragment>
                        <label className={style.s25Offscreen} id={this.getValuesLabelDomId()}>
                            {valuesLabel}
                        </label>
                        <div ref={this.valuesRef}
                             className={style.s25MultiValues}
                             tabIndex={0}
                             role="listbox"
                             aria-orientation="horizontal"
                             aria-activedescendant={this.getValueDomId(state.activeValue)}
                             aria-multiselectable="true"
                             aria-label={valuesLabel}
                             aria-labelledby={this.getValuesLabelDomId()}
                             onKeyDown={this.onValuesKeyDown}
                             onFocus={this.onValuesFocus}
                             onBlur={this.onValuesBlur}>
                            {state.values.map((value, index) => {
                                const selected = state.selectedValues.indexOf(index) >= 0;
                                const active = state.activeValue == index;
                                const id = this.getValueDomId(index);
                                const classes = cn(style.s25Item, {s25Active: active, s25Selected: selected});
                                return (
                                    <div key={index}
                                         id={id}
                                         className={classes}
                                         role="option"
                                         aria-selected={selected}
                                         aria-label={this.getItemLabel(value)}
                                         onClick={this.onValueClicked(index)}>
                                        <div className={style.s25Content}>
                                            {this.getValueContent(value)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </React.Fragment>
                    }

                    {scope(() => {
                        //
                        // REMOVE BUTTON
                        //
                        const disabled = state.selectedValues.length < 1;
                        const className = cn(style.s25Remove, {s25Offscreen: state.values.length < 1});
                        return (
                            <button className={className}
                                    onClick={this.onRemoveSelectedValuesClicked}
                                    onFocus={this.onRemoveValuesFocus}
                                    onBlur={this.onRemoveValuesBlur}
                                    disabled={disabled}
                                    aria-disabled={disabled}
                                    title={dict.removeButtonTitle()}>
                                <span>
                                    <IconRemove height={20} width={20}/>
                                </span>
                            </button>
                        );
                    })}

                    <label htmlFor={searchId} className={style.s25Offscreen}>
                        {searchLabel}
                    </label>
                    <input ref={this.searchRef}
                           className={style.s25Search}
                           type="text"
                           id={searchId}
                           value={state.search}
                           onChange={this.onSearchChanged}
                           onKeyDown={this.onSearchKeyDown}
                           onFocus={this.onSearchFocus}
                           onBlur={this.onSearchBlur}
                           role="combobox"
                           aria-autocomplete="none"
                           aria-haspopup="true"
                           aria-owns={dropdownId}
                           aria-controls={dropdownId}
                           aria-expanded={state.open}
                           aria-activedescendant={this.getSearchResultDomId(state.activeSearchResult)}
                           aria-busy={state.searchResultsLoading}
                    />

                </div>
                {/* s2body */}

                <div className={style.s25Toggle}
                     aria-hidden={true}
                     onMouseDownCapture={this.onToggleMouseDownCapture}
                     onClick={this.onToggleClick}>
                    <IconToggle height={20} width={20}/>
                </div>

                {state.open &&
                <Dropdown control={this.controlRef.current} className={style.s25Dropdown}>

                    <div className={style.s25Body + " " + style.s25SearchResults}
                         style={{maxHeight: "120px"}}
                         ref={this.dropdownRef}
                         aria-busy={state.searchResultsLoading}
                         id={dropdownId}
                         onScroll={this.onDropdownScroll}>
                        {state.searchResults && state.searchResults.length > 0 &&
                        (
                            <div className={style.s25Options}
                                 role="listbox"
                                 aria-activedescendant={this.getSearchResultDomId(state.activeSearchResult)}>
                                {
                                    state.searchResults.map((item, i) => {
                                        const className = cn(style.s25Item, {s25Active: state.activeSearchResult == i});
                                        return (
                                            <div key={i}
                                                 className={className}
                                                 id={this.getSearchResultDomId(i)}
                                                 onMouseDown={this.onMouseDownSearchResult(i)}
                                                 onMouseMove={this.onMouseEnterSearchResult(i)}
                                                 onMouseUp={this.onSearchResultClicked(i)}
                                                 role="option"
                                                 aria-selected={state.activeSearchResult === i}
                                            >
                                                {this.getResultContent(item)}
                                            </div>);
                                    })
                                }
                            </div>

                        )}
                        {state.showNoSearchResultsFound &&
                        <div className={style.s25NoSearchResults}>{dict.noSearchResults()}</div>
                        }
                        {(state.searchResultsLoading || state.showLoadMoreResults) &&
                        <div ref={this.loadingMoreResults}
                             className={cn(style.s25SearchResultsLoading, style.s25SearchResultsMessage)}>{dict.searchResultsLoading()}</div>
                        }
                        {(state.showMinimumCharactersError) &&
                        <div className={cn(style.s25SearchResultsMinimumError, style.s25SearchResultsMessage)}>
                            {dict.minimumCharactersMessage(state.search.length, props.minimumCharacters)}
                        </div>
                        }
                    </div>
                </Dropdown>
                }

            </div>
        )
    }

    getItemId(item: T): string {
        if (typeof this.props.itemId === "function") {
            return this.props.itemId(item);
        } else {
            return "" + item[this.props.itemId];
        }
    }

    getValueContent(item: T) {
        if (typeof this.props.valueContent === "function") {
            return this.props.valueContent(item);
        } else {
            return item[this.props.valueContent];
        }
    }

    getItemLabel(item: T): string {
        if (typeof this.props.itemLabel === "function") {
            return this.props.itemLabel(item);
        } else {
            return "" + item[this.props.itemLabel];
        }
    }

    getResultContent(item: T) {
        if (this.props.resultContent) {
            if (typeof this.props.resultContent === "function") {
                return this.props.resultContent(item);
            } else {
                return item[this.props.resultContent];
            }
        } else {
            return this.getValueContent(item);
        }
    }

    setActiveValue(index: number) {
        this.setState({activeValue: index});
    }

    toggleSelectedValue(index: number) {
        const oldSelected = this.state.selectedValues;
        const newSelected = oldSelected.slice();
        const pos = oldSelected.indexOf(index);
        if (pos >= 0) {
            newSelected.splice(pos, 1);
        } else {
            newSelected.push(index);
        }
        this.setState({selectedValues: newSelected, activeValue: index});

    }

    onRemoveSelectedValuesClicked = (event: React.MouseEvent) => {
        const selected = this.state.selectedValues;
        const values = this.state.values.slice();

        selected.sort();
        for (let i = 0; i < selected.length; i++) {
            values.splice(selected[i] - i, 1);
        }
        this.setState({values: values, selectedValues: [], activeValue: values.length > 0 ? 0 : -1});
        if (values.length > 0) {
            this.valuesRef.current.focus();
        } else {
            this.focusSearch();
        }
    }

    onValueClicked = (index: number) => (event: React.MouseEvent) => {
        this.toggleSelectedValue(index);
    }

    onValuesFocus = (event: React.FocusEvent) => {
        let index = 0;
        if (this.state.selectedValues.length > 0) {
            index = this.state.selectedValues[0];
        }
        this.setActiveValue(index);
        this.setState({focused: true});
    }

    onValuesBlur = (event: React.FocusEvent) => {
        this.setActiveValue(-1);
        this.setState({focused: false});
    }

    onValuesKeyDown = (event: React.KeyboardEvent) => {
        const values = this.state.values;
        const active = this.state.activeValue;

        //console.log(event.key);

        switch (event.key) {
            case Key.ArrowLeft: {
                if (active > 0) {
                    this.setActiveValue(active - 1);
                }
                event.preventDefault();
                break;
            }
            case Key.ArrowRight: {
                if (active < values.length - 1) {
                    this.setActiveValue(active + 1);
                }
                event.preventDefault();
                break;
            }
            case Key.PageDown: {
                // TODO
                event.preventDefault();
                break;
            }
            case Key.PageUp: {
                // TODO
                event.preventDefault();
                break;
            }
            case Key.Home: {
                this.setActiveValue(0);
                event.preventDefault();
                break;
            }
            case Key.End: {
                this.setActiveValue(values.length - 1);
                event.preventDefault();
                break;
            }
            case Key.Space: {
                this.toggleSelectedValue(active);
                event.preventDefault();
                break;
            }
        }
    }


    onSearchResultClicked = (index: number) => (event: React.MouseEvent) => {
        this.selectSearchResult(index);
        event.preventDefault();
    }

    onMouseDownSearchResult = (index: number) => (event: React.MouseEvent) => {
        if (this.state.activeSearchResult != index) {
            this.setActiveSearchResult(index);
        }
        event.preventDefault();
    }

    onMouseEnterSearchResult = (index: number) => (event: React.MouseEvent) => {
        if (this.lastMouseClientX == event.clientX && this.lastMouseClientY == event.clientY) {
            // the mouse did not move, the dropdown was scrolled instead, we do not change selected element because
            // it will be scrolled into view and mess with the scrolling of the results in the dropdown
            return;
        }


        this.lastMouseClientX = event.clientX;
        this.lastMouseClientY = event.clientY;
        if (this.state.activeSearchResult != index) {
            this.setActiveSearchResult(index);
        }
    }

    setActiveSearchResult = (index: number) => {
        this.setState({activeSearchResult: index});
    }

    onSearchKeyDown = (event: React.KeyboardEvent) => {
        const results = this.state.searchResults;

        if (!results || results.length < 1) {
            return;
        }

        const active = this.state.activeSearchResult;

        switch (event.key) {
            case Key.ArrowUp: {
                if (active > 0) {
                    this.setActiveSearchResult(active - 1);
                }
                event.preventDefault();
                break;
            }
            case Key.ArrowDown: {
                if (active < results.length - 1) {
                    this.setActiveSearchResult(active + 1);
                }
                event.preventDefault();
                break;
            }
            case Key.PageDown: {
                // TODO
                event.preventDefault();
                break;
            }
            case Key.PageUp: {
                // TODO
                event.preventDefault();
                break;
            }
            case Key.Home: {
                this.setActiveSearchResult(0);
                event.preventDefault();
                break;
            }
            case Key.End: {
                this.setActiveSearchResult(results.length - 1);
                event.preventDefault();
                break;
            }
            case Key.Escape: {
                this.close();
                event.preventDefault();
                break;
            }
            case Key.Enter: {
                this.selectSearchResult(this.state.activeSearchResult);
                break;
            }
        }
    }

    open = () => {
        this.search("");
        this.focusSearch();
    }

    close() {
        this.setState({
            open: false,
            searchResults: undefined,
            activeSearchResult: -1,
            showNoSearchResultsFound: false,
            searchResultsLoading: false,
            search: ""
        });
    }


    selectSearchResult(index: number) {
        const selected = this.state.searchResults[index];
        const values = this.state.values.slice();
        values.push(selected);
        this.setState({
            values: values
        });
        this.close();

        const label = this.getItemLabel(selected);
        announce.politely(dictionary(this.props.dictionary).valueAdded(label));
    }


    onRemoveValuesFocus = (event: React.FocusEvent) => {
        this.setState({focused: true});
    }

    onRemoveValuesBlur = (event: React.FocusEvent) => {
        this.setState({focused: false});
    }


    focusSearch() {
        this.searchFocussedPragmatically = true;
        this.searchRef.current.focus();
    }

    onSearchFocus = (event: React.FocusEvent) => {

        this.setState({focused: true});
        if (this.props.openOnSearchFocus && !this.searchFocussedPragmatically) {
            this.open();
        }

        this.searchFocussedPragmatically = false;
    }

    onSearchBlur = (event: React.FocusEvent) => {
        this.setState({focused: false, open: false, search: ""});
    }


    async search(value: string) {
        const props = this.props;
        const dict = dictionary(props.dictionary);
        const searchPage = 0;

        const minimumCharactersReached = (value.length >= this.props.minimumCharacters);

        this.setState({
            searchResults: undefined,
            searchResultDomIds: undefined,
            search: value,
            searchPage: searchPage,
            searchResultsLoading: minimumCharactersReached,
            showNoSearchResultsFound: false,
            open: true,
            activeSearchResult: -1,
            showLoadMoreResults: false,
            showMinimumCharactersError: !minimumCharactersReached
        });

        if (!minimumCharactersReached) {
            // todo - throttle this announcement?
            announce.politely(dict.minimumCharactersMessage(value.length, this.props.minimumCharacters));
            return;
        }

        // todo - throttle this announcement?
        announce.politely(dict.searchResultsLoading());
        try {
            const result = await this.props.query(value, searchPage);
            let searchResultDomIds: number[] = [];
            result.values.forEach(() => {
                searchResultDomIds.push(uuid())
            });

            if (result.values.length < 1) {
                announce.politely(dict.noSearchResults());
            }

            this.setState({
                searchResults: result.values,
                searchResultDomIds: searchResultDomIds,
                searchHasMoreResults: result.more,
                activeSearchResult: result.values.length > 0 ? 0 : -1,
                showNoSearchResultsFound: result.values.length < 1,
                searchResultsLoading: false,
                showLoadMoreResults: result.more,
                searchPage: 0
            });
        } catch (e) {
            // TODO for now assuming all failures are cancellations, should we treat them differently?

        }

    }

    onSearchChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        this.search(value);
    }

    async onLoadMore() {
        if (this.state.searchResultsLoading) {
            return;
        }
        const dict = dictionary(this.props.dictionary);
        const page = this.state.searchPage + 1;
        const value = this.searchRef.current.value;
        this.setState({
            searchResultsLoading: true,
        });

        announce.politely(dict.searchResultsLoading());

        try {
            const result = await this.props.query(value, page);
            const searchResultDomIds = this.state.searchResultDomIds.slice();
            const searchResults = this.state.searchResults.slice();
            result.values.forEach((result) => {
                searchResults.push(result);
                searchResultDomIds.push(uuid())
            });

            if (result.values.length < 1) {
                // TODO announce no further results
                announce.politely(dict.noSearchResults());
            }

            this.setState({
                searchResults: searchResults,
                searchResultDomIds: searchResultDomIds,
                searchHasMoreResults: result.more,
                searchResultsLoading: false,
                showLoadMoreResults: result.more,
                searchPage: page
                // TODO collapse showLoadMoreReults and searchhasMoreResults?
            });

        } catch (e) {
            // TODO for now assuming all failures are canellations, should we treat them differently?
        }


    }

    onDropdownScroll = (event: React.UIEvent) => {
        if (!this.state.showLoadMoreResults) {
            return;
        }
        const more = this.loadingMoreResults.current;
        const drop = this.dropdownRef.current;

        const visibility = util.calculateVerticalVisibility(drop, more);
        if (visibility !== "hidden") {
            this.onLoadMore();
        }

    }


    onRemove = (index: number) => (event: React.MouseEvent) => {
        const oldValues = this.state.values;
        const newValues = this.state.values.slice();
        const removedValue = newValues.splice(index, 1)[0];

        if (this.props.onValueRemoved) {
            this.props.onValueRemoved(removedValue, oldValues, newValues);
        }

        if (this.props.onValuesChanged) {
            this.props.onValuesChanged(newValues, oldValues);
        }

        this.setState({values: newValues}, () => {
            //console.log("set state callback");
            if (this.state.values.length == 0) {
                this.focusSearch();
            } else {
                const values = this.state.values;
                let focus = index;
                if (focus >= values.length) {
                    focus = values.length - 1;
                }
                document.getElementById(this.getValueDomId(focus)).focus();
            }

        });
    }

    getValuesLabelDomId() {
        return this.id + "-values-label";
    }


    getSearchDomId() {
        return this.id + "-search";
    }

    getDropdownDomId() {
        return this.id + "-dropdown";
    }


    getValueDomId(index: number) {
        return (index === undefined || index < 0) ? undefined : this.id + "-value-" + index;
    }

    getSearchResultDomId(index: number) {
        return (index === undefined || index < 0) ?
            undefined :
            this.id + "-result-" + this.state.searchResultDomIds[index];
    }

    onToggleMouseDownCapture = (event: React.MouseEvent) => {
        this.toggleWasOpen = this.state.open;
    }

    onToggleClick = (event: React.MouseEvent) => {
        if (this.toggleWasOpen) {
            this.close();
        } else {
            this.open();
        }
        this.focusSearch();
    }

}


class IconToggle extends React.PureComponent<{ height: number, width: number }, {}> {
    render() {
        const viewBox = "0 0 " + this.props.width + " " + this.props.height;
        return <svg height={this.props.height} width={this.props.width} viewBox={viewBox} tabIndex={-1}
                    focusable="false">
            <path
                d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
        </svg>
    }
}

class IconRemove extends React.PureComponent<{ height: number, width: number }, {}> {
    render() {
        const viewBox = "0 0 " + this.props.width + " " + this.props.height;
        return <svg height={this.props.height} width={this.props.width} viewBox={viewBox} tabIndex={-1}
                    focusable="false">
            <path
                d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
        </svg>
    }
}
