// import { encrypt } from './sjcl';
ready(async function () {
    function getSafes() {
        var plain = localStorage.getItem("entries");
        var data = JSON.parse(plain);
        var safes = [];
        data.forEach(datum => {
            safes.push(datum.safe);
        });
        return safes;
    }
    function getEntries(safe) {
        // var plain = localStorage.getItem("entries")
        // var data: Entry[] = JSON.parse(plain)
        // var safes: string[] = []
        // data.forEach(datum => {
        //   safes.push(datum.safe)
        // });
        // return safes
        return;
    }
    function asciiToUint8Array(str) {
        var chars = [];
        for (var i = 0; i < str.length; ++i)
            chars.push(str.charCodeAt(i));
        return new Uint8Array(chars);
    }
    async function encrypt(data) {
        try {
            var iv = crypto.getRandomValues(new Uint8Array(16));
            var alg = { name: "AES-GCM", iv: iv };
            var key = await window.crypto.subtle.importKey("raw", asciiToUint8Array(the("#key").value), alg.name, false, ["encrypt"]);
            var cipher = await crypto.subtle.encrypt(alg, key, new TextEncoder().encode(data));
            var text = fromByteArray(new Uint8Array(cipher));
            return [fromByteArray(iv), text].join(":");
        }
        catch (e) {
            throw e.message;
        }
    }
    async function decrypt(data) {
        try {
            var j = data.split(":");
            var iv = toByteArray(j[0]);
            var alg = { name: "AES-GCM", iv: iv };
            var key = await window.crypto.subtle.importKey("raw", asciiToUint8Array(the("#key").value), alg.name, false, ["decrypt"]);
            var plain = await crypto.subtle.decrypt(alg, key, toByteArray(j[1]));
            var text = new TextDecoder().decode(plain);
            return text;
        }
        catch (e) {
            throw e.message;
        }
    }
    function auth() {
        var usr = the("#username").value;
        var pak = the("#pak").value;
        return `Basic ${btoa(`${usr}:${pak}`)}`;
    }
    async function push() {
        var key = the("#key").value;
        var gist = the("#gist").value;
        var data = await encrypt(localStorage.getItem("entries"));
        var res = await fetch(`https://api.github.com/gists/${gist}`, {
            method: "PATCH",
            headers: { "Authorization": auth() },
            body: JSON.stringify({
                description: "Password safe",
                files: { safe: { content: data } }
            })
        });
        var j = await res.json();
        if (j.message != null)
            throw j.message;
        return;
    }
    function pull() {
        return new Promise((resolve, reject) => {
            var gist = the("#gist").value;
            fetch(`https://api.github.com/gists/${gist}`, {
                headers: { "Authorization": auth() }
            }).then((r) => {
                r.json().then(async (r) => {
                    if (r.message != null)
                        reject(r.message);
                    try {
                        var data = await decrypt(r.files.safe.content);
                    }
                    catch {
                        resolve("{}");
                    }
                    resolve(JSON.stringify(JSON.parse(data), null, 2));
                }).catch(reject);
            }).catch(reject);
        });
    }
    on("#sync", "click", async (e) => {
        var received = 0;
        var sent = 0;
        try {
            var theirs = JSON.parse(await pull());
            var ours = JSON.parse(localStorage.getItem("entries"));
            if (theirs == null) {
                theirs = {};
            }
            else if (ours == null) {
                localStorage.setItem("entries", JSON.stringify(theirs));
                return;
            }
            for (let key in theirs) {
                var their = theirs[key];
                var our = ours[key];
                if (our == null) {
                    ours[key] = their;
                    received++;
                }
                else if (our.date < their.date) {
                    ours[key] = their;
                    received++;
                }
                else if (our.date > their.date) {
                    sent++;
                }
            }
            await push();
            localStorage.setItem("entries", JSON.stringify(ours));
        }
        catch (r) {
            alert(r);
            throw r;
        }
        alert(`Done. ${received} updates received, ${sent} updates sent.`);
    });
    on("#push", "click", async (e) => {
        try {
            var result = await push();
            alert(result);
        }
        catch (r) {
            alert(r);
        }
    });
    on("#pull", "click", async (e) => {
        try {
            the("#data").value = await pull();
            alert("Database pulled");
        }
        catch (r) {
            alert(r);
        }
    });
    on("#save", "click", (e) => {
        var data = the("#data").value;
        localStorage.setItem("entries", data);
    });
    on("#save-key", "click", (e) => { localStorage.setItem("the-key", the("#key").value); });
    on("#save-username", "click", (e) => { localStorage.setItem("the-username", the("#username").value); });
    on("#save-pak", "click", (e) => { localStorage.setItem("the-pak", the("#pak").value); });
    on("#save-gist", "click", (e) => { localStorage.setItem("the-gist", the("#gist").value); });
    the("#key").value = localStorage.getItem("the-key");
    the("#username").value = localStorage.getItem("the-username");
    the("#pak").value = localStorage.getItem("the-pak");
    the("#gist").value = localStorage.getItem("the-gist");
    on("#key", "change keyup", (e) => {
        // dumpDB();
    });
    on("#genpass", "click", (e) => {
        the("#key").value = genValidPassword(32, [hex]);
        // dumpDB()
    });
});
