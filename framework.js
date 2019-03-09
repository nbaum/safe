var pasteboard = null;
function yank(text) {
    if (pasteboard === null) {
        pasteboard = document.createElement("div");
        pasteboard.style.height = "1px";
        pasteboard.style.position = "absolute";
        pasteboard.style.overflow = "hidden";
        document.body.appendChild(pasteboard);
    }
    var paste = document.createElement("textarea");
    paste.value = text;
    pasteboard.appendChild(paste);
    paste.select();
    document.execCommand("cut");
    pasteboard.removeChild(paste);
}
function ready(f) {
    if (document.readyState === 'complete' || document.readyState !== 'loading')
        f();
    else
        on(document, 'DOMContentLoaded', f);
}
function the(sel) {
    return document.querySelector(sel);
}
function all(sel) {
    return document.querySelectorAll(sel);
}
function on(element, event, handler) {
    if (typeof element == "string")
        element = the(element);
    if (element == null)
        return;
    var events = event.split(" ");
    for (var i = 0; i < events.length; ++i)
        element.addEventListener(events[i], handler);
}
