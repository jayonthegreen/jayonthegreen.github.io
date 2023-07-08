
export default function pathsToTree (paths) {

    let result = [];
    let level = {result};

    paths.forEach(path => {
        path.split('/').reduce((r, name, i, a) => {
            if(!r[name]) {
                r[name] = {result: []};
                r.result.push({name, children: r[name].result})
            }

            return r[name];
        }, level)
    })
    console.log(result)
    return result
}
