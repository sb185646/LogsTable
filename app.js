const { exec } = require('child_process');
const express = require('express');
const { html } = require('./utils');
const diff = require('lodash/difference')
const render = require('js-data-table').default;
const app = express();
app.use(express.json());
const port = 3005;
const commands = {

}
const pods = [
    {
        "podName": "NAME",
        "status": "STATUS"
    },
    {
        "podName": "svclb-jarvis-rediscache-v7c8r",
        scale: ''
    },
    {
        "podName": "svclb-jarvis-rediscache-f2h6t",
        scale: ''
    },
    {
        "podName": "svclb-jarvis-mosquitto-j6n88",
        scale: ''
    },
    {
        "podName": "svclb-jarvis-rediscache-r4gh8",
        scale: ''
    },
    {
        "podName": "svclb-jarvis-mosquitto-qhqjg",
        scale: ''
    },
    {
        "podName": "svclb-jarvis-mosquitto-vhptv",
        scale: ''
    },
    {
        "podName": "jarvis-rediscache-fd6846878-d6scn",
        scale: ''
    },
    {
        "podName": "jarvis-mongodb-8699c48f8-4rbkt",
        scale: ''
    },
    {
        "podName": "jarvis-mosquitto-585bd68957-plwfx",
        scale: ''
    },
    {
        "podName": "jarvis-jarvisconfigservice-59fc5c96d-p7hjw",
        scale: ''
    },
    {
        "podName": "jarvis-scoxweightsecurity-798d5d6f4-jrjqk",
        scale: ''
    },
    {
        "podName": "jarvis-scoxtrilight-687bdf5c85-xz7pj",
        scale: ''
    },
    {
        "podName": "jarvis-scoxweightlearning-f98d66ff9-d46cn",
        scale: ''
    },
    {
        "podName": "jarvis-scoxpicklist-75844874b-zlbgx",
        scale: ''
    },
    {
        "podName": "jarvis-scoxauthentication-59bbd65dfb-zndfz",
        scale: ''
    },
    {
        "podName": "jarvis-scoxintervention-5898f5496-g7jvs",
        scale: ''
    },
    {
        "podName": "jarvis-scoxerrorlookup-66dc5b5dfc-x9s85",
        scale: ''
    },
    {
        "podName": "jarvis-scoxcashservice-746df5f56f-7cdbx",
        scale: ''
    },
    {
        "podName": "jarvis-scoxcoupon-57577c75b-mdf4z",
        scale: ''
    },
    {
        "podName": "jarvis-scoxvisualverify-774cfd74b-9jlj2",
        scale: ''
    },
    {
        "podName": "jarvis-scoxui-766c978d7b-bdc4v",
        scale: ''
    },
    {
        "podName": "jarvis-scoxprinter-5f7f69c8f7-qhz4z",
        scale: ''
    },
    {
        "podName": "jarvis-scoxdoc-84bbf6f9f4-bstrw",
        scale: ''
    },
    {
        "podName": "jarvis-scoxcoreservice-6f5bf6868-zd7vn",
        scale: ''
    },
    {
        "podName": "jarvis-scoxinputsequencer-b957c65fc-pppn6",
        scale: ''
    },
    {
        "podName": "jarvis-scoxresources-cd6b85495-bdbbj",
        scale: ''
    },
    {
        "podName": "jarvis-poslessadapter-cd6b85495-bdbbj",
        scale: ''
    }
]
const getPodNameWithoutHash = (n) => {
    const p = n?.split('-');
    if (!p?.[0]) {
        return ''
    }
    if (p[0] === 'svclb') {
        return `${p[0]}-${p[1]}-${p[2]}`
    }
    return `${p[0]}-${p[1]}`
}
const getScaledDownPods = (current, old) => diff(old.map(c => getPodNameWithoutHash(c.podName)), current.map(c => getPodNameWithoutHash(c.podName)));

app.use((req, res, next) => {
    console.log('Requesting URL: ', req.url);
    next()
})
app.get('/', (_, res) => {
    res.send(html(`<div style=display:flex;align-items:center;justify-content:center;height:95vh;>
    <button onclick="myJavascriptFunction()" class=app-button>Get Logs</button>
    </div>`));
})
app.get('/pods', (req, res) => {
    exec('kubectl get pods -n store', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.send('<h1>OOPS! Failed to get logs</h1>')
            return;
        }
        const containers = stdout.split('\n').reduce((a, s) => {
            const { 0: podName, 2: status } = s.split(' ').filter(c => c);
            a.push({ podName, status, scale: 'up' })
            return a;
        }, []);
        
        containers.push(...getScaledDownPods(containers, pods).map(c => ({ podName: c, scale: 'down' })))
        res.send(html(containers.map(({ podName, status, scale }) => {
            let a = '';
            if (podName) {
                const showButtons = podName.toUpperCase() !== 'NAME'
                    ? `
                <form style=display:initial;margin:0;flex:1; method="GET" action=/${scale === 'up' ? 'scale-pod-down' : 'scale-pod-up'}/${podName}>
                <button>${scale === 'up' ? 'Scale Down' : 'Scale up'}</button> 
                </form>` : '<div style=flex:1;>Scale</div>';
                a += `
                <div style=margin:0px;white-space:break-spaces;display:flex;justify-content:space-evenly;align-items:center;>
                <a href=/pod-logs/${podName} style=flex:1;>${podName}</a>
                <span style=flex:1;>${status}</span>
                ${showButtons}
                <br/></div>
                `;
            }
            return a
        }).join('')))
    });
})

app.get('/pod-logs/:id', (req, res) => {
    const query = `kubectl logs -n store ${req.params.id}`
    console.log({ id: req.params.id, query })
    exec(query, (error, stdout, stderr) => {
        let finalRes = '';
        if (error) {
            try {
                finalRes += `<h3>${error.message}</h3>`
            } catch (e) {
                res.send('<h1>OOPS! Failed to get logs</h1>', e)
                return;
            }
        }
        const errored = [];
        const logs = stdout.split('\n').filter(l => !l.includes('[Nest]'))
            .map(c => {
                try {
                    const res = JSON.parse(c.replace(String.fromCharCode(92), String.fromCharCode()));
                    if (res.hasOwnProperty('time') && res.hasOwnProperty('level')) {
                        res['posless'] = true
                    }
                    else {
                        res['posless'] = false
                    }
                    return res
                } catch (err) {
                    errored.push(c);
                    return { time: 'failed to parse the logs', message: c }
                }
            })
        finalRes += render(logs);
        res.send(finalRes)
    });
})

app.get('/:podUpDown/:id', (req, res) => {
    console.log(getPodNameWithoutHash(req.params.id), req.params.podUpDown)
    exec(`kubectl scale deploy ${getPodNameWithoutHash(req.params.id)} -n store --replicas=${req.params.podUpDown === 'scale-pod-down' ? 0 : 1}`, (error, stdout, stderr) => {
        if (error) {
            res.send('<h1>OOPS! Failed to scale down</h1>')
            return;
        }
        res.send(stdout)
    })
})

app.listen(port, () => {
    console.log('Server started at ' + port, 'Check logs at http://localhost:3005/pods');
});