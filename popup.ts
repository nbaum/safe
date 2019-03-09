ready(function () {

  const storage = localStorage
  const eForget = the<HTMLButtonElement>("#forget")
  const eEntries = the<HTMLSelectElement>("#entries")
  const eName = the<HTMLInputElement>("#name")
  const eSafe = the<HTMLInputElement>("#safe")
  const eHost = the<HTMLInputElement>("#host")
  const eUsername = the<HTMLInputElement>("#username")
  const ePassword = the<HTMLInputElement>("#password")
  const eNotes = the<HTMLInputElement>("#notes")

  var link: HTMLAnchorElement = null
  var entries : Entry[] = JSON.parse(storage.getItem("entries"))
  var theEntry : Entry = null
  var tab : chrome.tabs.Tab = null

  function storeEntries () {
    storage.setItem("entries", JSON.stringify(entries))
  }

  function findEntries (host: string): Entry[] {
    return entries.map((entry, index) => {
      entry.index = index
      return entry
    }).filter(entry => {
      if (!entry.host)
        return false
      var hosts = entry.host.split(/[,\s]+/)
      return hosts.some(entry => {
        if (host == entry)
          return true;
        if (host.endsWith("." + entry))
          return true;
        if (host.startsWith(entry + ":"))
          return true;
        return false;
      })
    })
  }

  function linkify (url: string) {
    if (!link) link = document.createElement("a")
    link.href = url
  }

  function getFormEntry () : Entry {
    var indexStr = eEntries.selectedOptions[0].value
    var index = null
    if (indexStr != "new")
      index = parseInt(indexStr)
    return {
      index: index,
      name: eName.value,
      host: eHost.value,
      username: eUsername.value,
      password: ePassword.value,
      notes: eNotes.value,
      safe: eSafe.value,
      date: 0
    }
  }

  function storeEntry () {
    var e = getFormEntry()
    theEntry = e
    e.date = new Date().getTime()
    if (e.index == null) {
      e.index = entries.length
      entries.push(e)
    } else
      entries[e.index] = e
    storeEntries();
  }

  function storeFloatingEntry () {
    if (theEntry.index ==  null)
      storage.setItem("float", JSON.stringify(getFormEntry()))
  }

  on(eName, "input", storeFloatingEntry)
  on(eUsername, "input", storeFloatingEntry)
  on(ePassword, "input", storeFloatingEntry)
  on(eNotes, "input", storeFloatingEntry)

  function getFloatingEntry () : Entry {
    var e = {
      name: "",
      username: "",
      password: genValidPassword(),
      notes: "",
      safe: "Default"
    }
    var s = storage.getItem("float")
    if (s != null)
      e = JSON.parse(s)
    return {
      name: e.name,
      host: link.host,
      username: e.username,
      password: e.password,
      notes: e.notes,
      index: null,
      safe: e.safe,
      date: 0,
    }
  }

  function upgrade (e: Entry): Entry {
    if (e.safe == null)
      e.safe = "Default"
    if (e.date == null)
      e.date = 0
    return e
  }

  function loadEntry (index: number) {
    var e = index == null ? getFloatingEntry() : entries[index]
    e = upgrade(e)
    eName.value = e.name
    eHost.value = e.host
    eUsername.value = e.username
    ePassword.value = e.password
    eNotes.value = e.notes
    eSafe.value = e.safe
    e.index = index
    theEntry = e
  }

  function examineSituation () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      tab = tabs[0]
      var url = tab.url
      linkify(url)
      var entries = findEntries(link.host)
      eEntries.innerHTML = '';
      var index = 0
      entries.forEach((entry, i) => {
        if (storage.getItem("index"))
          if (parseInt(storage.getItem("index")) == entry.index)
            index = i
        if (theEntry && theEntry.index == entry.index)
          index = i
        var o = document.createElement("option")
        o.value = entry.index.toString()
        if (entry.name)
          o.innerHTML = entry.name
        else
          o.innerHTML = entry.username
          eEntries.add(o)
      })
      var o = document.createElement("option")
      o.value = "new"
      o.innerHTML = "(new)"
      eEntries.add(o)
      eEntries.selectedIndex = index
      eEntries.click()
      chrome.tabs.sendMessage(tab.id, {action: "checkInject", args: theEntry},
        function (result) {
          the<HTMLButtonElement>("#inject").disabled = !result
      })
      // chrome.tabs.sendMessage(tab.id, {action: "checkScrape", args: theEntry},
      //   function (result) {
      //     the<HTMLButtonElement>("#scrape").disabled = !result
      // })
    })
  }

  on(eEntries, 'click', e => {
    var opt = (<HTMLOptionElement>e.target).value
    loadEntry(opt == "new" ? null : parseInt(opt))
    if (theEntry.index)
      storage.setItem("index", theEntry.index.toString())
  })

  on('#save', 'click', function (e) {
    storeEntry()
    storage.removeItem("float")
    examineSituation();
  })

  on('#copy_username', 'click', function (e) {
    yank(eUsername.value)
  })

  on('#copy_password', 'click', function (e) {
    yank(ePassword.value)
  })

  on('#forget', 'click', function (e) {
    entries.splice(theEntry.index, 1)
    storeEntries()
    examineSituation()
  })

  on('#inject', 'click', function (e) {
    chrome.tabs.sendMessage(tab.id, {action: "inject", args: theEntry}, null)
    examineSituation()
  })

  on('#settings', 'click', function (e) {
    chrome.tabs.create({url: "settings.html"})
  })

  on('#scrape', 'click', function (e) {
    chrome.tabs.sendMessage(tab.id, {action: "scrape", args: null}, function(data){
      eUsername.value = data[0]
      ePassword.value = data[1]
    })
  })

  on('#gen_password', 'click', e => {
    ePassword.value = genValidPassword()
  })

  examineSituation()

})
