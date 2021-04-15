const http = require('http');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

function processRecipeUrl(body) {
    if (body !== '') {
        let bodyObject = JSON.parse(body);
        let url = bodyObject.url;
        if (bodyObject && url) {
            console.log(url);
            return url;
        }
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
            'Content-Type': 'application/json'
        })

        response.write('' +
            '<html>' +
                '<body>' +
                    '<h3>Grocery Run Server Homepage</h3>' +
                '</body>' +
            '</html>');
        response.end();
    } else if (request.url.startsWith('/recipe')) {
        if (request.method === 'OPTIONS') {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Request-Method', '*');
            response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
            response.setHeader('Access-Control-Allow-Headers', '*');
            response.writeHead(200);
            response.end();
        } else {
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
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    })
                    let $ = cheerio.load(content);
                    let ingredients = $('.ingredient');
                    if (ingredients.length === 0) {
                        ingredients = $('.ingredients-item-name')
                    }
                    let recipe = {};
                    recipe.title = $('title')[0].children[0].data;
                    recipe.url = url;
                    recipe.ingredients = [];
                    for (let index = 0; index < ingredients.length; index++) {
                        recipe.ingredients.push(ingredients[index].children[0].data);
                    }
                    console.log(recipe)
                    response.write(JSON.stringify(recipe));
                    response.end();
                })
            });

        }
    }
});

server.listen(5000);

console.log('Grocery Run Server at port 5000 is running...');