function generateRandomColor() {
    return 'white'
}
const TYPES = {
    STRING: 'string',
    NUMBER: 'number',
    OBJECT: 'object',
    BOOLEAN: 'boolean',
    isARRAY: (v) => Array.isArray(v),
    isBoolean: (v) => typeof v === TYPES.BOOLEAN,
    isObject: (v) => typeof v === TYPES.OBJECT,
    isNotObject: (v) => !TYPES.isObject(v)
};
const getHeadings = (v) => ([...new Set(v.reduce((a, k) => {
    if (k)
        a.push(Object.keys(k))
    return a
}, []).flat())])
const render = (o) => {
    let str = '';
    try {
        str = TYPES.isARRAY(o)
            ? ArrayTable((TYPES.isObject(o?.[0]) ?
                Object.keys(o[0])
                // getHeadings(o)
                : null) || [], o, 'rootObj')
            : TYPES.isObject(o)
                ? ObjectTable(o, 'rootObj')
                : (o.toString() || '""')
        return str;
    } catch (e) {
        return 'error'
        // error('Failed to parse html', e, v)
    }
}
const ObjectTable = (obj, id) => {
    return `<table border=1 frame=true bgcolor=${generateRandomColor()} id=${id} name='Object Table'>
    <tbody>
    ${Object.keys(obj).map((c, index) => {
        const key = c;
        const value = obj[c];
        return `<tr>
                <th class='heading' ">${key}</th>
                <td class='body-value' id=${key}>${TYPES.isARRAY(value)
                ?
                (
                    ArrayTable(TYPES.isObject(value?.[0])
                        ? Object.keys(value[0] || {})
                        // ? getHeadings(value)
                        : value?.[0],
                        value,
                        // key,
                        `${key}`
                    )
                )
                :
                (TYPES.isObject(value) && value != null)
                    ? ObjectTable(value, `${key}`)
                    : TYPES.isBoolean(value) ? `<b style=color:${value ? 'green' : 'red'}>${value}</b>` : value?.toString()}</td></tr>`
    }).join('')}
    </tbody>
    </table>`
}
const ArrayTable = (headings, body, id) => {
    if (!body.length) {
        return '[]'
    }
    headings = getHeadings(body)
    // console.log([...headings])
    let showHeadings = true;
    if (TYPES.isNotObject(body[0])) {
        showHeadings = false;
    }
    // <!-- <th class='custom-dt'>Row No</th> -->
    return `<table border=1 frame=true bgcolor=${generateRandomColor()} id=${id}>
    ${showHeadings ? `<thead style=background:#bde1bd;position:sticky;top:0;><tr>
    <th></th>
    ${headings.map(c => `<th class='heading' style="padding:10px" onclick="sortTable(event)">${c?.toUpperCase()}</th>`).join('')}</tr></thead>` : ''}
    <tbody>
    ${body.map((c, index) => {
        if (typeof c !== 'string') {
            return `<tr style=--hover-color:green>${showHeadings ? `<td id='[${index}]-customID'>${index + 1}</td>` : ''}${[TYPES.STRING, TYPES.NUMBER].includes(typeof headings) ? `<td id='[${index}]'>--SS${c}</td>` : headings?.map(h => {

                const _id = (TYPES.isARRAY(c[h]) || (TYPES.isObject(c[h]) && c[h] != null)) ? `[${index}]-${h}` : `[${index}]-${h}`
                return `<td id=${_id}>${TYPES.isARRAY(c[h])
                    ?
                    (
                        ArrayTable(
                            Object.keys(c[h]?.[0] || {}),
                            // getHeadings(c[h]),
                            c[h],
                            _id //`${h}-[${index}]`
                        )
                    )
                    : (TYPES.isObject(c[h]) && c[h] != null)
                        ? ObjectTable(c[h], `[${index}]-${h}`)
                        : (TYPES.isBoolean(c[h]) ? `<b style=color:${c[h] ? 'green' : 'red'}>${c[h]}</b>` : (c[h]?.toString()))}
    </td>`
            }).join('')}</tr>`
        }
        else {
            return `<td>${c}</td>`
        }
    }).join('')}
    </tbody>
    </table>`
}
const html = (content) => `<html>
    <script> 
    function myJavascriptFunction() {
        window.open('/pods') 
    }
    </script>
    <style>
        .app-button{
            height: 50px;
            width: 125px;
            border-radius: 25px;
            background: #33c464;
            border: none;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }
        .app-button:hover{
            background: #da7474;
        }
    </style>
    <body>
    ${content}
    
    </body> 
    </html>`
// render
module.exports = { render, html }