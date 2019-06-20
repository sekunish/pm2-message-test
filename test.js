const http = require('http');

let port = 0;
for (let i = 0; i < 4; i++) {
    port = 8080 + i;
    http.request({ hostname: '127.0.0.1', port: port, method: 'get' }, (res) => {
        res.on('data', (chunk) => {
            console.log(`i[${i}] res.data.chunk[${chunk}].`);
        });
        res.on('end', () => {
            console.log(`i[${i}] res.end.`);
        });
    }).end((chunk) => {
        console.log(`i[${i}] end.`);
    })
}

