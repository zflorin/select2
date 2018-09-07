import {CommonWrapper} from "enzyme";


export function makeQuery(count: number, pages: number = 1): ((search: string, page: number) => Promise<any>) {
    if (count == 0) return function () {
        return Promise.resolve({values: [], more: false})
    };

    const pageSize = count / pages;
    return function (search: string, page: number) {
        const offset = page * pageSize;
        const size = Math.min(count - offset, pageSize);
        const values = [];
        for (let i = 0; i < size; i++) {
            values.push({id: i, text: search + "-" + (offset + i)});
        }
        return Promise.resolve({values: values, more: size == pageSize});
    }
}


export function waitFor(condition: () => boolean, stacktrace?: any): Promise<void> {

    if (!stacktrace) {
        stacktrace=stacktrace(waitFor);
    }

    return new Promise<void>((resolve: any, reject: any) => {

        if (condition()) {
            resolve();
        }

        let attempts = 0;
        const timeout = 2000;
        const delay = 10;
        const interval = setInterval(() => {
            if (condition()) {
                clearInterval(interval);
                resolve();
            } else if (attempts * delay > timeout) {
                const error = new Error("Reached wait timeout");
                error.stack = stacktrace;

                reject(error);
            } else {
                attempts++;
            }
        }, delay);

    });
}

export function waitForState<T=any>(component: CommonWrapper, condition: (state: T) => boolean) {
    return waitFor(() => {
        return condition(component.state() as T);
    },stacktrace(waitForState));
}


function stacktrace(ignore?:any) {
    const stack:any={};
    Error.captureStackTrace(stack, ignore);
    return stack.stack;
}