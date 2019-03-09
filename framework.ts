
var pasteboard:any = null

function yank (text:string) {
  if (pasteboard === null) {
    pasteboard = document.createElement("div")
    pasteboard.style.height = "1px"
    pasteboard.style.position = "absolute"
    pasteboard.style.overflow = "hidden"
    document.body.appendChild(pasteboard)
  }
  var paste = document.createElement("textarea")
  paste.value = text
  pasteboard.appendChild(paste)
  paste.select()
  document.execCommand("cut")
  pasteboard.removeChild(paste)
}

function ready (f : () => void) {
  if (document.readyState === 'complete' || document.readyState !== 'loading')
    f()
  else
    on(document, 'DOMContentLoaded', f)
}

function the<T extends Element> (sel:string): T {
  return <T>document.querySelector(sel)
}

function all (sel:string): NodeListOf<Node> {
  return document.querySelectorAll(sel)
}

function on (element:Node|string, event:string, handler:(e?:Event) => void) {
  if (typeof element == "string")
    element = the(<string>element)
  if (element == null)
    return;
  var events = event.split(" ")
  for (var i = 0; i < events.length; ++i)
    element.addEventListener(events[i], handler)
}
