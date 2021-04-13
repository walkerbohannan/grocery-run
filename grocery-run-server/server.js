const http = require('http');

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
            
            response.writeHead(200, {
                'Content-Type': 'application/json'
            })
            response.write('OK, got it.');
            response.end();
        });



    }
});

server.listen(5000);

console.log('Grocery Run Server at port 5000 is running...');