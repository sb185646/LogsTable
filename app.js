const { exec } = require('child_process');
const express = require('express');
const render = require('./table');
const app = express();
app.use(express.json());
const port = 3005;

app.get('/logs', (req, res) => {
    exec('kubectl get pods -n store', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.send('<h1>OOPS! Failed to get logs</h1>')
            return;
        }
        res.send(stdout.split('\n').reduce((a, s) => {
            const podName = s.split(' ')[0];
            a += '<div style=margin:20px;white-space:break-spaces;>' + (`<a href=/pod-logs/${podName}>${podName}</a>` + '\n') + '</div>';
            return a;
        }, ''))
    });
})
app.use((req, res, next) => {
    // res.send('(() => { console.log("ksaljd") })()');
    next()
})
app.get('/pod-logs/:id', (req, res) => {

    exec(`kubectl logs -n store ${req.params.id}`, (error, stdout, stderr) => {
        if (error) {
            res.send('<h1>OOPS! Failed to get logs</h1>')
            return;
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
        const finalRes = render(logs);
        res.send(finalRes)
    });
})

app.listen(port, () => {
    console.log('Server started at ' + port, 'Check logs at http://localhost:3005/logs')
});
