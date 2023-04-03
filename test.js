const fs = require('fs').promises

async function scan(d, f) {
    if(!f) f = []
    let l = await fs.readdir(d)
    for(let k in l) {
        let stat = await fs.stat(d + '/' + l[k])
        if(stat.isDirectory()) await scan(d + '/' + l[k], f)
        else if (l[k] == 'build.js') f.push(d) //f.push(d + '/' + l[k]) <- add files to [l]ist
    }
    return f
}

scan('./src').then(f => console.log(f))