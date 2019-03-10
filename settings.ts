import { hash } from "./sjcl";

// import { encrypt } from './sjcl';

ready(async function () {

  interface Params {
    name: string
    iv: Uint8Array
    key: CryptoKey
    salt: Uint8Array
    iterations: number
    hash: string
    length: number
  }
  
  function asciiToUint8Array(str: string) : Uint8Array {
    var chars = [];
    for (var i = 0; i < str.length; ++i)
        chars.push(str.charCodeAt(i));
    return new Uint8Array(chars);
  }

  async function genkey(p: Params): Promise<Params> {
    var key1 = await window.crypto.subtle.importKey("raw", asciiToUint8Array(the<HTMLInputElement>("#key").value), "PBKDF2", false, ["deriveKey"])
    var key2 = await window.crypto.subtle.deriveKey({name: "PBKDF2", salt: p.salt, hash: p.hash, iterations: p.iterations}, key1, {name: p.name, length: p.length}, false, ["decrypt", "encrypt"])
    p.key = key2
    return p
  }

  async function genParams(): Promise<Params> {
    var p = {
      name: "AES-GCM",
      iv: crypto.getRandomValues(new Uint8Array(16)),
      salt: crypto.getRandomValues(new Uint8Array(16)) ,
      iterations: 10000,
      hash: "SHA-512",
      length: 256,
      key: <CryptoKey> null,
    }
    return await genkey(p)
  }

  function encodeParams(p: Params): any {
    return {
      name: p.name,
      iv: fromByteArray(p.iv),
      salt: fromByteArray(p.salt),
      iterations: p.iterations,
      hash: p.hash,
      length: p.length,
    }
  }

  async function decodeParams(p: any): Promise<Params> {
    var r = {
      name: p.name,
      iv: toByteArray(p.iv),
      salt: toByteArray(p.salt),
      iterations: p.iterations,
      hash: p.hash,
      length: p.length,
      key: <CryptoKey> null,
    }
    return await genkey(r)
  }

  async function encrypt(data: string): Promise<string> {
    try {
      var p = await genParams()
      var cipher = await crypto.subtle.encrypt(p, p.key, new TextEncoder().encode(data))
      var text = fromByteArray(new Uint8Array(cipher))
      return JSON.stringify({alg: encodeParams(p), data: text})
    } catch (e) {
      throw e.message
    }
  }

  async function decrypt(data: string): Promise<string> {
    try {
      var j = JSON.parse(data)
      var p = await decodeParams(j.alg)
      var plain = await crypto.subtle.decrypt(p, p.key, toByteArray(j.data))
      var text = new TextDecoder().decode(plain)
      return text
    } catch (e) {
      throw e.message
    }
  }

  function auth(): string {
    var usr = the<HTMLInputElement>("#username").value
    var pak = the<HTMLInputElement>("#pak").value
    return `Basic ${btoa(`${usr}:${pak}`)}`
  }

  async function push(): Promise<void> {
    var key = the<HTMLInputElement>("#key").value
    var gist = the<HTMLInputElement>("#gist").value
    var data = await encrypt(localStorage.getItem("entries"))
    var res = await fetch(`https://api.github.com/gists/${gist}`, {
      method: "PATCH",
      headers: { "Authorization": auth() },
      body: JSON.stringify({
        description: "Password safe",
        files: { safe: { content: data } }
      })
    })
    var j = await res.json()
    if (j.message != null)
      throw j.message
    return
  }

  function pull(): Promise<string> {
    return new Promise((resolve, reject) => {
      var gist = the<HTMLInputElement>("#gist").value
      fetch(`https://api.github.com/gists/${gist}`, {
        headers: { "Authorization": auth() }
      }).then((r) => {
        r.json().then(async (r) => {
          if (r.message != null)
            reject(r.message)
          try {
            var data = await decrypt(r.files.safe.content)
          } catch {
            resolve("{}")
          }
          resolve(JSON.stringify(JSON.parse(data), null, 2))
        }).catch(reject)
      }).catch(reject)
    })
  }

  on("#sync", "click", async (e) => {
    var received = 0
    var sent = 0
    try {
      var theirs = JSON.parse(await pull())
      var ours = JSON.parse(localStorage.getItem("entries"))
      if (theirs == null) {
        theirs = {}
      } else if (ours == null) {
        localStorage.setItem("entries", JSON.stringify(theirs))
        return
      }
      for (let key in theirs) {
        var their = theirs[key]
        var our = ours[key]
        if (our == null) {
          ours[key] = their
          received++
        } else if (our.date < their.date) {
          ours[key] = their
          received++
        } else if (our.date > their.date) {
          sent++
        }
      }
      await push()
      localStorage.setItem("entries", JSON.stringify(ours))
    } catch (r) {
      alert(r)
      throw r
    }
    alert(`Done. ${received} updates received, ${sent} updates sent.`)
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

  on("#save-key", "click", (e) => { localStorage.setItem("the-key", the<HTMLInputElement>("#key").value) })
  on("#save-username", "click", (e) => { localStorage.setItem("the-username", the<HTMLInputElement>("#username").value) })
  on("#save-pak", "click", (e) => { localStorage.setItem("the-pak", the<HTMLInputElement>("#pak").value) })
  on("#save-gist", "click", (e) => { localStorage.setItem("the-gist", the<HTMLInputElement>("#gist").value) })

  the<HTMLInputElement>("#key").value = localStorage.getItem("the-key")
  the<HTMLInputElement>("#username").value = localStorage.getItem("the-username")
  the<HTMLInputElement>("#pak").value = localStorage.getItem("the-pak")
  the<HTMLInputElement>("#gist").value = localStorage.getItem("the-gist")

  on("#key", "change keyup", (e) => {
    // dumpDB();
  })

  on("#genpass", "click", (e) => {
    the<HTMLInputElement>("#key").value = genValidPassword(32, [hex])
    // dumpDB()
  })

})
