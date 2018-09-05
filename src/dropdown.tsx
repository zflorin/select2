import * as React from "react";
import * as util from "./util";
import {createPortal} from "react-dom";

export interface DropdownProps {
    control: HTMLElement, // TODO make this a ref
    className?: string,
    children: React.ReactNode
}

export class Dropdown extends React.PureComponent<DropdownProps, {}> {

    container: HTMLElement;

    scrollParents: EventTarget[];
    private readonly throttledPosition: () => void;

    constructor(props: DropdownProps) {
        super(props);
        this.throttledPosition = util.throttle(50, this.position);
    }

    componentWillMount() {
        this.container = document.createElement("div");
        const cn = this.props.className;
        if (cn) {
            this.container.setAttribute("class", cn);
        }
        document.body.appendChild(this.container);

    }

    componentWillUnmount() {
        this.scrollParents.forEach((parent) => {
            ["resize", "scroll", "touchmove"].forEach((event) => {
                parent.removeEventListener(event, this.throttledPosition);
            });
        });
        delete this.scrollParents;
        document.body.removeChild(this.container);
        delete this.container;
    }


    render() {
        return createPortal(this.props.children, this.container);
    }

    componentDidMount() {
        this.scrollParents = util.getScrollParents(this.props.control);
        this.scrollParents.forEach((parent) => {
            ["resize", "scroll", "touchmove"].forEach((event) => {
                parent.addEventListener(event, this.throttledPosition);
            });
        });
        this.position();
    }

    componentDidUpdate() {
        this.position();
    }

    position = () => {
        const control = this.props.control;
        const rect = control.getBoundingClientRect();
        const style = `
            top: ${rect.top + rect.height + window.pageYOffset}px;
            left: ${rect.left + window.pageXOffset}px;
            width: ${rect.width}px;
        `;
        // TODO also called on scroll of children - should not be
        // console.log("position");
        this.container.setAttribute("style", style);
    }
}

