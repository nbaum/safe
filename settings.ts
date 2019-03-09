// import { encrypt } from './sjcl';

ready(function () {

  function getSafes (): string[] {
    var plain = localStorage.getItem("entries")
    var data: Entry[] = JSON.parse(plain)
    var safes: string[] = []
    data.forEach(datum => {
      safes.push(datum.safe)
    });
    return safes
  }

  function getEntries (safe: string): Entry[] {
    // var plain = localStorage.getItem("entries")
    // var data: Entry[] = JSON.parse(plain)
    // var safes: string[] = []
    // data.forEach(datum => {
    //   safes.push(datum.safe)
    // });
    // return safes
    return
  }

  function encrypt(data: string): string {
    var key = the<HTMLInputElement>("#key").value
    var cipher = sjcl.encrypt(key, data)
    var json = JSON.stringify(cipher)
    var base64 = btoa(json).match(/.{1,76}/g).join("\n")
    return base64
  }

  function decrypt(data: string): string {
    var key = the<HTMLInputElement>("#key").value
    var base64 = data.split("\n").join("")
    var json = atob(base64)
    var cipher = JSON.parse(json)
    return sjcl.decrypt(key, cipher)
  }

  function dumpDB () {
    var key = the<HTMLInputElement>("#key").value;
    var plain = localStorage.getItem("entries")
    var data = JSON.parse(plain)
    var json = JSON.stringify(data, null, 2)
    the<HTMLTextAreaElement>("#data").value = json
  }

  function auth(): string {
    var usr = the<HTMLInputElement>("#username").value
    var pak = the<HTMLInputElement>("#pak").value
    return `Basic ${btoa(`${usr}:${pak}`)}`
  }

  function push(): Promise<string> {
    return new Promise((resolve, reject) => {
      var key = the<HTMLInputElement>("#key").value
      var gist = the<HTMLInputElement>("#gist").value
      var data = encrypt(localStorage.getItem("entries"))
      fetch(`https://api.github.com/gists/${gist}`, {
        method: "PATCH",
        headers: { "Authorization": auth() },
        body: JSON.stringify({
          description: "Password safe",
          files: { safe: { content: data } }
        })
      }).then((r) => {
        r.json().then((r) => {
          if (r.message != null)
            reject(r.message)
          resolve("Pushed")
        }).catch(reject)
      }).catch(reject)
    })
  }

  function pull(): Promise<string> {
    return new Promise((resolve, reject) => {
      var gist = the<HTMLInputElement>("#gist").value
      fetch(`https://api.github.com/gists/${gist}`, {
        headers: { "Authorization": auth() }
      }).then(function(r){
        r.json().then(function(r){
          if (r.message != null)
            reject(r.message)
          var data = decrypt(r.files.safe.content)
          resolve(JSON.stringify(JSON.parse(data), null, 2))
        }).catch(reject)
      }).catch(reject)
    })
  }

  on("#sync", "click", async (e) => {
    var result
    try {
      var theirs = JSON.parse(await pull())
      var ours = JSON.parse(localStorage.getItem("entries"))
      for (let key in theirs) {
        var their = theirs[key]
        var our = ours[key]
        if (our.date < their.date)
          ours[key] = their
      }
      result = await push()
    } catch (r) {
      result = r
    }
    alert(result)
  })

  on("#push", "click", async (e) => {
    try {
      var result = await push()
      alert(result)
    } catch (r) {
      alert(r)
    }
  })

  on("#pull", "click", async (e) => {
    try {
      the<HTMLTextAreaElement>("#data").value = await pull()
      alert("Database pulled")
    } catch (r) {
      alert(r)
    }
  })

  on("#save", "click", (e) => {
    var data = the<HTMLTextAreaElement>("#data").value
    localStorage.setItem("entries", data)
  })

  on("#key", "change keyup", (e) => {
    dumpDB();
  })

  on("#genpass", "click", (e) => {
    the<HTMLInputElement>("#key").value = genValidPassword(32, [hex])
    dumpDB()
  })

  dumpDB();

})
