const http = require('http');
const fetch = require('node-fetch');

function processRecipeUrl(body) {
    let bodyObject = JSON.parse(body);
    let url = bodyObject.url;
    if (bodyObject && url) {
        console.log(url);
        return url;
    } else {
        return "Could not process recipe: URL not found."
    }
}

async function getRecipeContent(url) {
    const response = await fetch(url);
    return await response.text();
}

const server = http.createServer(function (request, response) {
    if (request.url === '/') {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        })

        response.write('' +
            '<html>' +
                '<body>' +
                    '<h3>Grocery Run Server Homepage</h3>' +
                '</body>' +
            '</html>');
        response.end();
    } else if (request.url.startsWith('/recipe')) {
        console.log('Processing recipe...\n');
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            let url = processRecipeUrl(body);
            console.log('>> URL:' + url + ' <<');

            getRecipeContent(url).then(content => {
                response.writeHead(200, {
                    'Content-Type': 'application/text'
                })
                response.write(content);
                response.end();
            })
        });



    }
});

server.listen(5000);

console.log('Grocery Run Server at port 5000 is running...');