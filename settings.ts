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

  function addDates(data: string): string {
    var rs = JSON.parse(data)
    rs = rs.map((r:any) => {
      if (r.date == null) {
        r.date = new Date().getTime()
      }
      return r
    });
    return JSON.stringify(rs)
  }

  function encrypt(key: string, data: string): string {
    var cipher = sjcl.encrypt(key, data)
    var json = JSON.stringify(cipher)
    var base64 = btoa(json).match(/.{1,76}/g).join("\n")
    return base64
  }

  function decrypt(key: string, data: string): string {
    var base64 = data.split("\n").join("")
    var json = atob(base64)
    var cipher = JSON.parse(json)
    return sjcl.decrypt(key, cipher)
  }

  function dumpDB () {
    var key = the<HTMLInputElement>("#key").value;
    var plain = addDates(localStorage.getItem("entries"))
    if (key == "") {
      var data = JSON.parse(plain)
      var json = JSON.stringify(data, null, 2)
      the<HTMLTextAreaElement>("#data").value = json
    } else {
      the<HTMLTextAreaElement>("#data").value = encrypt(key, plain)
    }
  }

  on("#sync", "click", (e) => {
    var key = the<HTMLInputElement>("#key").value;
    var gist = the<HTMLInputElement>("#gist").value;
    fetch(`https://api.github.com/gists/${gist}`).then(function(r){
      r.json().then(function(r){
        console.log(r)
        var base64 = r.files.safe.content
        var json = atob(base64)
        var cipher = JSON.parse(json)
        var plain = sjcl.decrypt(key, cipher)
      })
    })
  })

  on("#push", "click", (e) => {
    var key = the<HTMLInputElement>("#key").value
    var gist = the<HTMLInputElement>("#gist").value
    var data = encrypt(key, addDates(localStorage.getItem("entries")))
    var body = {
      description: "Password safe",
      files: {
        safe: {
          content: encrypt(key, data)
        }
      }
    }
    fetch(`https://api.github.com/gists/${gist}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }).then(function(r){
      r.json().then(function(r){
        console.log(r)
      })
    })
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
