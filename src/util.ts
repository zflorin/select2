import * as style from "./select2.scss";
import * as classNames from "classnames/bind";
import * as React from "react";

export const cn = classNames.bind(style);

export function extend(...params: object[]) {
    for (let i = 1; i < arguments.length; i++)
        for (let key in arguments[i])
            if (arguments[i].hasOwnProperty(key)) {
                if (typeof arguments[0][key] === 'object'
                    && typeof arguments[i][key] === 'object')
                    extend(arguments[0][key], arguments[i][key]);
                else
                    arguments[0][key] = arguments[i][key];
            }
    return arguments[0];
}

export const Key = {
    // https://www.w3.org/TR/uievents-key/#named-key-attribute-values
    ArrowDown: "ArrowDown",
    ArrowUp: "ArrowUp",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    Space: " ",
    Enter: "Enter",
    Tab: "Tab",
    Home: "Home",
    End: "End",
    PageUp: "PageUp",
    PageDown: "PageDown",
    Backspace: "Backspace",
    Delete: "Delete",
    Clear: "Clear",
    Escape: "Escape"
};

export const uuid = (function () {
    let counter = 0;
    return function () {
        return counter++;
    }
})();


export function debounce(quiet: number, delegate: (...args: any[]) => void, that: Object) {
    let timeout: number = undefined;
    if (quiet < 0) {
        return function () {
            delegate.apply(that, arguments);
        }
    } else {
        return function () {
            const args = arguments;
            if (timeout) {
                window.clearTimeout(timeout);
            }
            timeout = window.setTimeout(function () {
                timeout = undefined;
                delegate.apply(that, args);
            }, quiet);
        };
    }
}

export function getScrollParents(el: HTMLElement): EventTarget[] {
    const style = window.getComputedStyle(el);
    const elementPosition = style.position;
    if (elementPosition == "fixed") {
        return [el];
    }

    const parents = [];
    let parent = el.parentElement;

    while (parent && parent.nodeType == 1) {
        const style = window.getComputedStyle(parent);
        if (/(overlay|scroll|auto)/.test(style.overflow + " " + style.overflowX + " " + style.overflowY)) {
            if (elementPosition != "absolute" || ["relative", "fixed", "absolute"].indexOf(style.position) >= 0) {
                parents.push(parent);
            }
        }
        parent = parent.parentElement;
    }

    parents.push(el.ownerDocument.body);

    // iframe
    if (el.ownerDocument !== document) {
        parents.push(el.ownerDocument.defaultView);
    }

    parents.push(window);
    return parents;
}

export function throttle(delay: number, callback: () => void): () => void {
    let timeout: number = undefined;
    return function () {
        if (timeout != undefined) {
            window.clearTimeout(timeout);
            timeout = undefined;
        }

        if (timeout == undefined) {
            timeout = window.setTimeout(function () {
                callback();
                timeout = undefined;
            }, delay);
        }
    };
}


export function calculateVerticalVisibility(container: HTMLElement, element: HTMLElement): "hidden" | "partial-top" | "partial-bottom" | "visible" {
    const c = container.getBoundingClientRect();
    const e = element.getBoundingClientRect();

    if (e.bottom < c.top) {
        // above the fold
        return "hidden";
    }

    if (e.top > c.bottom) {
        // below the fold
        return "hidden";
    }

    if (e.top < c.top && e.bottom <= c.bottom) {
        return "partial-top";
    }

    if (e.top >= c.top && e.bottom > c.bottom) {
        return "partial-bottom";
    }

    return "visible";

}

/** helper that makes it easier to declare a scope inside a jsx block */
export function scope(delegate: () => React.ReactChild) {
    return delegate();
}


