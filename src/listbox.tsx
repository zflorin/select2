import * as React from "react";
import {ReactChild} from "react";
import {Key, uuid} from "./util";

interface ListboxProps<T> {
    items: T[];
    selected: number[];

    onChange(selected: number[]): void;

    elementRef?: React.RefObject<HTMLDivElement>;

    itemClassName(item: T, index: number, selected: boolean, active: boolean): string;

    itemLabel: ((item: T) => string) | (keyof T);
    itemContent?: ((item: T) => (string | React.ReactChild)) | (keyof T);

    orientation?: "horizontal" | "vertical";
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    className?: string;

    onFocus?(event: React.FocusEvent): void;

    onBlur?(event: React.FocusEvent): void;
}

interface ListboxState<T> {
    active: number;
}

export class Listbox<T> extends React.PureComponent<ListboxProps<T>, ListboxState<T>> {

    static defaultProps = {
        orientation: "vertical"
    };

    id: string;
    ref: React.RefObject<HTMLDivElement>;

    constructor(props: ListboxProps<T>) {
        super(props);

        this.ref = React.createRef();

        this.state = {
            active: -1,
        }
    }

    componentWillMount() {
        this.id = uuid();
    }


    focus() {
        this.ref.current.focus();
    }

    render() {
        const props = this.props;
        const state = this.state;

        return (
            <div ref={this.ref}
                 className={props.className}
                 tabIndex={0}
                 role="listbox"
                 aria-orientation={props.orientation}
                 aria-activedescendant={this.getValueDomId(state.active)}
                 aria-multiselectable="true"
                 aria-label={props.ariaLabel}
                 aria-labelledby={props.ariaLabelledBy}
                 aria-describedby={props.ariaDescribedBy}
                 onKeyDown={this.onKeyDown}
                 onFocus={this.onFocus}
                 onBlur={this.onBlur}>
                {props.items.map((value, index) => {
                    const selected = props.selected.indexOf(index) >= 0;
                    const active = state.active == index;
                    const id = this.getValueDomId(index);
                    const classes = props.itemClassName(value, index, selected, active)
                    return (
                        <div key={index}
                             id={id}
                             className={classes}
                             role="option"
                             aria-selected={selected}
                             aria-checked={selected}
                             aria-label={this.getItemLabel(value)}
                             onClick={this.onItemClicked(index)}>
                            {this.getItemContent(value)}
                        </div>
                    );
                })}
            </div>
        );
    }

    onItemClicked = (index: number) => (event: React.MouseEvent) => {
        this.toggleSelectedValue(index);
        this.ref.current.focus();
        event.stopPropagation(); // do not propagate to body listener
    };


    getValueDomId(index: number) {
        return (index === undefined || index < 0) ? undefined : this.id + "-value-" + index;
    }

    onKeyDown = (event: React.KeyboardEvent) => {
        const values = this.props.items;
        const active = this.state.active;

        //console.log(event.key);

        switch (event.key) {
            case Key.ArrowLeft:
            case Key.ArrowUp: {
                if (active > 0) {
                    this.setActiveValue(active - 1);
                }
                event.preventDefault();
                break;
            }
            case Key.ArrowRight:
            case Key.ArrowDown: {
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
    };

    onFocus = (event: React.FocusEvent) => {
        if (this.state.active < 0) {
            if (this.props.items.length > 0) {
                let index = 0;
                if (this.props.selected.length > 0) {
                    index = this.props.selected[0];
                }
                this.setActiveValue(index);
            }
        }
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    };

    onBlur = (event: React.FocusEvent) => {
        this.setActiveValue(-1);
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    };


    setActiveValue(index: number) {
        this.setState({active: index});
    }

    toggleSelectedValue(index: number) {
        const oldSelected = this.props.selected;
        const newSelected = oldSelected.slice();
        const pos = oldSelected.indexOf(index);
        if (pos >= 0) {
            newSelected.splice(pos, 1);
        } else {
            newSelected.push(index);
        }

        this.props.onChange(newSelected);
    }

    getItemLabel(item: T): string {
        if (typeof this.props.itemLabel === "function") {
            return this.props.itemLabel(item);
        } else {
            return "" + item[this.props.itemLabel];
        }
    }

    getItemContent(item: T): ReactChild {
        if (this.props.itemContent === undefined) {
            return this.getItemLabel(item);
        } else if (typeof this.props.itemContent === "function") {
            return this.props.itemContent(item);
        } else {
            return "" + item[this.props.itemContent];
        }
    }


}