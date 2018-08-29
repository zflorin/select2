export function initialize() {
    if (document.getElementById("s25-live")) {
        return;
    }

    const live = document.createElement("div");
    live.setAttribute("id", "s25-live");
    live.setAttribute("class", "s25-offscreen s25-live");
    document.body.appendChild(live);

    const assertive = document.createElement("div");
    assertive.setAttribute("id", "s25-live-assertive");
    assertive.setAttribute("role", "log");
    assertive.setAttribute("aria-live", "assertive");
    assertive.setAttribute("aria-relevant", "additions");
    live.appendChild(assertive);

    const polite = document.createElement("div");
    polite.setAttribute("id", "s25-live-polite");
    polite.setAttribute("role", "log");
    polite.setAttribute("aria-live", "polite");
    polite.setAttribute("aria-relevant", "additions");
    live.appendChild(polite);

}

export function assertively(message: string) {
    const node = document.createElement("div");
    node.appendChild(document.createTextNode(message));
    document.getElementById("s25-live-assertive").appendChild(node);
    // TODO clean up old nodes


    // for debugging
    const live = document.getElementById("s25-live");
    live.scrollTop = live.scrollHeight;

}

export function politely(message: string) {
    const node = document.createElement("div");
    node.appendChild(document.createTextNode(message));
    document.getElementById("s25-live-polite").appendChild(node);


    // for debugging
    const live = document.getElementById("s25-live");
    live.scrollTop = live.scrollHeight;

    // TODO clean up old nodes
}
