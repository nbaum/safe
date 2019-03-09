// if (e.ownerDocument && "function" == typeof e.ownerDocument.createEvent) {
//   var i = e.ownerDocument.createEvent("Events");
//   if (i.initEvent("change", !0, !0),
//   e.dispatchEvent(i),
//   i = e.ownerDocument.createEvent("Events"),
//   i.initEvent("input", !0, !0),
//   e.dispatchEvent(i),
//   void 0 !== ischrome && ischrome && "function" == typeof e.onkeyup) {
//       n && (i.keyCode = 8);
//       e.onkeyup(i)
//   }
// } else
//   void 0 !== e.fireEvent && (e.fireEvent("onchange"),
//   e.fireEvent("oninput"));
// if ((void 0 === t || null == t || t) && "function" == typeof sendKey && sendKey("SHIFT", e),
// "function" == typeof lpGetBrowserForDocument) {
//   var r = lpGetBrowserForDocument(e.ownerDocument);
//   r && (r.lpfieldchanged = !0)
// }
function fire(elem, name) {
    var event = elem.ownerDocument.createEvent("Events");
    event.initEvent(name, true, true);
    elem.dispatchEvent(event);
    return event;
}
function sendKey(el, key) {
    var ev = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, code: "ShiftLeft", shiftKey: true });
    el.dispatchEvent(ev);
    var ev = new KeyboardEvent("keypress", { bubbles: true, cancelable: true, code: "ShiftLeft", shiftKey: true });
    el.dispatchEvent(ev);
    var ev = new KeyboardEvent("keyup", { bubbles: true, cancelable: true, code: "ShiftLeft", shiftKey: true });
    el.dispatchEvent(ev);
}
const Actor = {
    inject: (args, f) => {
        window.setTimeout(() => {
            var u = the("form input:not([type='hidden'])");
            var p = the("form input[type='password']");
            u.value = args.username;
            p.value = args.password;
            fire(u, "change");
            fire(u, "input");
            sendKey(u, "ShiftLeft");
            fire(p, "change");
            fire(p, "input");
            sendKey(p, "ShiftLeft");
        }, 300);
    },
    scrape: (args, f) => {
        var u = the("form input:not([type='hidden'])");
        var p = the("form input[type='password']");
        f([u.value, p.value]);
    },
    checkInject: (args, f) => {
        f(the("form input:not([type='hidden'])") && the("form input[type='password']"));
    },
    checkScrape: (args, f) => {
        var u = the("form input:not([type='hidden'])");
        var p = the("form input[type='password']");
        f((u ? u.value != "" : false) && (p ? p.value != "" : false));
    }
};
chrome.runtime.onMessage.addListener(function (request, sender, respond) {
    Actor[request.action](request.args, respond);
});
