export function initialize() {
    if (document.getElementById("s2-live")) {
        return;
    }

    const live = document.createElement("div");
    live.setAttribute("id", "s2-live");
    live.setAttribute("class", "s2-offscreen s3-live");
    document.body.appendChild(live);

    const assertive = document.createElement("div");
    assertive.setAttribute("id", "s2-live-assertive");
    assertive.setAttribute("role", "log");
    assertive.setAttribute("aria-live", "assertive");
    assertive.setAttribute("aria-relevant", "additions");
    live.appendChild(assertive);

    const polite = document.createElement("div");
    polite.setAttribute("id", "s2-live-polite");
    polite.setAttribute("role", "log");
    polite.setAttribute("aria-live", "polite");
    polite.setAttribute("aria-relevant", "additions");
    live.appendChild(polite);

}

export function assertively(message: string) {
    const node = document.createElement("div");
    node.appendChild(document.createTextNode(message));
    document.getElementById("s2-live-assertive").appendChild(node);
    // TODO clean up old nodes


    // for debugging
    const live = document.getElementById("s2-live");
    live.scrollTop = live.scrollHeight;

}

export function politely(message: string) {
    const node = document.createElement("div");
    node.appendChild(document.createTextNode(message));
    document.getElementById("s2-live-polite").appendChild(node);


    // for debugging
    const live = document.getElementById("s2-live");
    live.scrollTop = live.scrollHeight;

    // TODO clean up old nodes
}
