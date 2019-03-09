
interface Entry {
  name: string
  host: string
  username: string
  password: string
  notes: string
  index: number
  safe: string
  date: number
}

class Database {

  backend: Storage;

  constructor (backend: Storage) {
    this.backend = backend;
  }

  get (host: string) : Entry {
    let parts = []
    let domains = []
    for (let part of host.split(".").reverse()) {
      parts.push(part)
      domains.push(parts.slice().reverse().join("."))
    }
    domains.reverse()
    for (let domain of domains) {
      let x = this.backend.getItem(domain)
      if (x) {
        let data = JSON.parse(x)
        if (!data.site)
          data.site = domain
        if (data.site.indexOf(":") != -1)
          data.site = data.site.split(":", 2)[1]
        return data
      }
    }
  }

  set (host: string, data: Entry) {
    this.backend.setItem(host, JSON.stringify(data))
  }

  unset (host:string) {
    this.backend.removeItem(host)
  }

}

let db = new Database(localStorage)

let letters  = "abcdefghijklmnopqrstuvwxyz"
let capitals = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
let digits   = "0123456789"
let symbols  = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
let hex      = "0123456789abcdef"

let DEFAULT_ALPHABET = [capitals, letters, digits, symbols]

function genValidPassword (len: number = 12, alphabet: string[] = DEFAULT_ALPHABET) {
  while (true) {
    var pass = genPassword(len, alphabet.join(""))
    if (validatePassword(pass, alphabet))
      return pass;
  }
}

function validatePassword (needles: String, haystacks: String[]): boolean {
  haystacks = haystacks.slice()
  for (var i = 0; i < needles.length; ++i) {
    for (var j = 0; j < haystacks.length; ++j) {
      if (haystacks[j].indexOf(needles[i]) >= 0) {
        haystacks.splice(j, 1)
        break
      }
    }
  }
  return haystacks.length == 0
}

function genPassword (len: number, chars: String) {
  var string = ""
  var array = new Uint32Array(len)
  window.crypto.getRandomValues(array)
  for (var i = 0; i < len; ++i)
    string += chars[array[i] % chars.length]
  return string
}
