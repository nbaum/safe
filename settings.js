// import { encrypt } from './sjcl';
ready(function () {
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
    function encrypt(data) {
        var key = the("#key").value;
        var cipher = sjcl.encrypt(key, data);
        var json = JSON.stringify(cipher);
        var base64 = btoa(json).match(/.{1,76}/g).join("\n");
        return base64;
    }
    function decrypt(data) {
        var key = the("#key").value;
        var base64 = data.split("\n").join("");
        var json = atob(base64);
        var cipher = JSON.parse(json);
        return sjcl.decrypt(key, cipher);
    }
    // function dumpDB () {
    //   var key = the<HTMLInputElement>("#key").value;
    //   var plain = localStorage.getItem("entries")
    //   var data = JSON.parse(plain)
    //   var json = JSON.stringify(data, null, 2)
    //   the<HTMLTextAreaElement>("#data").value = json
    // }
    function auth() {
        var usr = the("#username").value;
        var pak = the("#pak").value;
        return `Basic ${btoa(`${usr}:${pak}`)}`;
    }
    function push() {
        return new Promise((resolve, reject) => {
            var key = the("#key").value;
            var gist = the("#gist").value;
            var data = encrypt(localStorage.getItem("entries"));
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
                        reject(r.message);
                    resolve("Pushed");
                }).catch(reject);
            }).catch(reject);
        });
    }
    function pull() {
        return new Promise((resolve, reject) => {
            var gist = the("#gist").value;
            fetch(`https://api.github.com/gists/${gist}`, {
                headers: { "Authorization": auth() }
            }).then(function (r) {
                r.json().then(function (r) {
                    if (r.message != null)
                        reject(r.message);
                    var data = decrypt(r.files.safe.content);
                    resolve(JSON.stringify(JSON.parse(data), null, 2));
                }).catch(reject);
            }).catch(reject);
        });
    }
    on("#sync", "click", async (e) => {
        var result;
        try {
            var theirs = JSON.parse(await pull());
            var ours = JSON.parse(localStorage.getItem("entries"));
            for (let key in theirs) {
                var their = theirs[key];
                var our = ours[key];
                if (our.date < their.date)
                    ours[key] = their;
            }
            result = await push();
        }
        catch (r) {
            result = r;
        }
        alert(result);
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
    // dumpDB();
});
