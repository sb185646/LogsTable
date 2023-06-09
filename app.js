const { exec } = require('child_process');
const express = require('express');
const { render, html } = require('./utils');
const app = express();
app.use(express.json());
const port = 3005;
const commands = {

}

const getPodNameWithoutHash = (n) => {
    const p = n.split('-');
    return `${p[0]}-${p[1]}`
}
app.use((req, res, next) => {
    console.log('Requesting URL: ', req.url)
    next()
})
app.get('/', (_, res) => {


    res.send(html(`<div style=display:flex;align-items:center;justify-content:center;height:95vh;>
    <button onclick="myJavascriptFunction()" class=app-button>Get Logs</button>
    </div>`))
})
app.get('/pods', (req, res) => {
    exec('kubectl get pods -n store', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.send('<h1>OOPS! Failed to get logs</h1>')
            return;
        }
        res.send(html(stdout.split('\n').reduce((a, s) => {
            const { 0: podName, 2: status } = s.split(' ').filter(c => c);
            if (podName) {
                const showButtons = podName.toUpperCase() !== 'NAME'
                    ? `
                <form style=display:initial;margin:0; method="GET" action=/scale-pod-down/${podName}>
                <button>${'Scale Down'}</button> 
                </form>` : '';
                a += `
                <div style=margin:20px;white-space:break-spaces;display:flex;justify-content:space-evenly;align-items:center;>
                <a href=/pod-logs/${podName}>${podName}</a>
                <span>${status}</span>
                ${showButtons}
                <br/></div>
                `;
            }
            return a;
        }, '')))
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

app.get('/scale-pod-up/:id', (req, res) => {
    console.log(getPodNameWithoutHash(req.params.id))
    exec(`kubectl scale deploy ${getPodNameWithoutHash(req.params.id)} -n store --replicas=1`, (error, stdout, stderr) => {
        if (error) {
            res.send('<h1>OOPS! Failed to scale up</h1>')
            return;
        }
        res.send(stdout)
    })
})
app.get('/scale-pod-down/:id', (req, res) => {
    console.log(getPodNameWithoutHash(req.params.id))
    exec(`kubectl scale deploy ${getPodNameWithoutHash(req.params.id)} -n store --replicas=0`, (error, stdout, stderr) => {
        if (error) {
            res.send('<h1>OOPS! Failed to scale down</h1>')
            return;
        }
        res.send(stdout)
    })
})

app.listen(port, () => {
    console.log('Server started at ' + port, 'Check logs at http://localhost:3005/pods')
});
