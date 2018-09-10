import * as React from "react";
import * as style from "./select2.scss";
import * as classNames from "classnames/bind";
import {Dictionary} from "./dictionary";
import * as util from "./util";

let cn = classNames.bind(style);

export interface ResultsProps<T> {
    search: string;
    minimumCharacters: number;

    searchResults: T[] | undefined;
    searchResultsLoading: boolean;
    searchHasMoreResults: boolean;
    activeSearchResult: number;
    showNoSearchResultsFound: boolean;
    showLoadMoreResults: boolean;
    showMinimumCharactersError: boolean;

    listboxDomId: string;

    searchResultDomId(index:number):string;

    itemLabel(item: T): string;

    resultContent(item: T): (string | React.ReactChild);

    dictionary: Dictionary;

    onLoadMore(): void;

    onActivateSearchResult(index: number): void;

    onSelectSearchResult(index: number): void;
}

export class Results<T> extends React.PureComponent<ResultsProps<T>, {}> {

    containerRef: React.RefObject<HTMLDivElement>;
    loadingMoreResults: React.RefObject<HTMLDivElement>;

    lastMouseClientX: number;
    lastMouseClientY: number;


    constructor(props: ResultsProps<T>) {
        super(props);
        this.containerRef = React.createRef();
        this.loadingMoreResults = React.createRef();
    }

    render() {

        const props = this.props;
        const dict = props.dictionary;

        return <div className={style.s25SearchResults}
                    style={{maxHeight: "120px"}}
                    ref={this.containerRef}
                    aria-busy={props.searchResultsLoading}
                    onScroll={this.onScroll}>
            {props.searchResults && props.searchResults.length > 0 &&
            (
                <div
                    id={props.listboxDomId}
                    className={style.s25Options}
                    role="listbox"
                    aria-activedescendant={this.props.searchResultDomId(props.activeSearchResult)}>
                    {
                        props.searchResults.map((item, i) => {
                            const className = cn(style.s25Item, {s25Active: props.activeSearchResult == i});
                            return (
                                <div key={i}
                                     className={className}
                                     id={this.props.searchResultDomId(i)}
                                     onMouseDown={this.onMouseDownSearchResult(i)}
                                     onMouseMove={this.onMouseEnterSearchResult(i)}
                                     onMouseUp={this.onSearchResultClicked(i)}
                                     role="option"
                                     aria-posinset={i + 1}
                                     aria-selected={props.activeSearchResult === i}
                                     aria-label={props.itemLabel(item)}
                                >
                                    {props.resultContent(item)}
                                </div>);
                        })
                    }
                </div>

            )}
            {props.showNoSearchResultsFound &&
            <div className={style.s25NoSearchResults}>{dict.noSearchResults()}</div>
            }
            {(props.searchResultsLoading || props.showLoadMoreResults) &&
            <div ref={this.loadingMoreResults}
                 className={cn(style.s25SearchResultsLoading, style.s25SearchResultsMessage)}>{dict.searchResultsLoading()}</div>
            }
            {(props.showMinimumCharactersError) &&
            <div className={cn(style.s25SearchResultsMinimumError, style.s25SearchResultsMessage)}>
                {dict.minimumCharactersMessage(props.search.length, props.minimumCharacters)}
            </div>
            }
        </div>
    }

    onScroll = (event: React.UIEvent) => {
        if (!this.props.showLoadMoreResults) {
            return;
        }
        const more = this.loadingMoreResults.current;
        const drop = this.containerRef.current;

        const visibility = util.calculateVerticalVisibility(drop, more);
        if (visibility !== "hidden") {
            this.props.onLoadMore();
        }

    };


    onMouseDownSearchResult = (index: number) => (event: React.MouseEvent) => {
        if (this.props.activeSearchResult != index) {
            this.props.onActivateSearchResult(index);
        }
        event.preventDefault();
    };

    onMouseEnterSearchResult = (index: number) => (event: React.MouseEvent) => {
        if (this.lastMouseClientX == event.clientX && this.lastMouseClientY == event.clientY) {
            // the mouse did not move, the dropdown was scrolled instead, we do not change selected element because
            // it will be scrolled into view and mess with the scrolling of the results in the dropdown
            return;
        }


        this.lastMouseClientX = event.clientX;
        this.lastMouseClientY = event.clientY;
        if (this.props.activeSearchResult != index) {
            this.props.onActivateSearchResult(index);
        }
    };

    onSearchResultClicked = (index: number) => (event: React.MouseEvent) => {
        this.props.onSelectSearchResult(index);
        event.preventDefault();
    };

    componentDidUpdate(prevProps: ResultsProps<T>, prevState: ResultsProps<T>) {

        if (prevProps.activeSearchResult != this.props.activeSearchResult) {

            if (this.props.activeSearchResult >= 0
                && this.props.searchResults.length > 0
                && this.props.activeSearchResult == (this.props.searchResults.length - 1)
                && this.props.showLoadMoreResults) {
                // last result is selected and load more is shown, make sure it is scrolled into view

                const drop = this.containerRef.current;
                const el = this.loadingMoreResults.current;

                drop.scrollTop = el.offsetTop + el.offsetHeight - drop.clientHeight;


                //console.log("scrolling to see load more");//, setting scrolltop", drop, el, el.offsetTop - drop.clientHeight);


            } else if (this.props.activeSearchResult >= 0) {
                // make sure it is scrolled into view
                const id = this.props.searchResultDomId(this.props.activeSearchResult);
                const el = document.getElementById(id);
                if (el != null) {
                    const drop = this.containerRef.current;

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
}