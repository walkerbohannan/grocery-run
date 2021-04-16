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

function findHalfBakedHarvestIngredients($) {
    let wprmRecipeIngredients = $('.wprm-recipe-ingredients');
    let ingredients = [];
    for (let i = 0; i < wprmRecipeIngredients.length; i++) {
        let recipeIngredientsChildren = wprmRecipeIngredients[i].children;
        for (let j = 0; j < recipeIngredientsChildren.length; j++) {
            let recipeIngredientsChild = recipeIngredientsChildren[j];
            if (recipeIngredientsChild.type === "tag") {
                let ingredient = '';
                for (let k = 0; k < recipeIngredientsChild.children.length; k++) {
                    let child = recipeIngredientsChild.children[k];
                    if (child.type === "tag") {
                        let firstChild = child.children[0];
                        if (child.attribs.class === "wprm-recipe-ingredient-amount") {
                            ingredient += firstChild.data + " "
                        } else if (child.attribs.class === "wprm-recipe-ingredient-unit") {
                            ingredient += firstChild.data + " "
                        } else if (child.attribs.class === "wprm-recipe-ingredient-name") {
                            if (firstChild.type === "tag" && firstChild.name === "a") {
                                ingredient += firstChild.children[0].data;
                            } else {
                                ingredient += firstChild.data + ""
                            }
                        }
                    }
                }
                ingredients.push(ingredient);
            }
        }
    }
    return ingredients;
}

function findAllRecipesIngredients($) {
    let ingredients = $('.ingredients-item-name');
    let recipeIngredients = [];
    for (let index = 0; index < ingredients.length; index++) {
        recipeIngredients.push(ingredients[index].children[0].data);
    }
    return recipeIngredients;
}

function findSmittenKitchenIngredients($) {
    let ingredients = $('.ingredient');
    let recipeIngredients = [];
    for (let index = 0; index < ingredients.length; index++) {
        recipeIngredients.push(ingredients[index].children[0].data);
    }
    return recipeIngredients;
}

function findBonAppetitIngredients($) {
    let parsedIngredients = [];
    let ingredientList = $('.recipe__ingredient-list')[0].children;
    ingredientList.forEach((i) => {
        if (i.type === "tag" && i.name === "div") {
            let ingredients = i.children;
            let ingredientName = '';
            for (let index = 0; index < ingredients.length; index++) {
                if (ingredients[index].name === "p") {
                    let amount = ingredients[index].children.length > 0 ? ingredients[index].children[0].data : '';
                    ingredientName = amount + " ";
                } else if (ingredients[index].name === "div") {
                    ingredientName+=ingredients[index].children[0].data;
                    parsedIngredients.push(ingredientName);
                    ingredientName = '';
                }
            }
        }
    })
    return parsedIngredients;
}

function constructRecipeIngredients(content, url) {
    let $ = cheerio.load(content);
    let ingredients = findSmittenKitchenIngredients($);
    if (ingredients.length === 0) {
        ingredients = findAllRecipesIngredients($)
    }

    if (ingredients.length === 0) {
        ingredients = findHalfBakedHarvestIngredients($);
    }

    if (ingredients.length === 0) {
        ingredients = findBonAppetitIngredients($);
    }

    //parseTheHtmlYourself()?

    let recipe = {};
    recipe.title = $('title')[0].children[0].data;
    recipe.url = url;
    recipe.ingredients = ingredients;
    return recipe;
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
                    let recipe = constructRecipeIngredients(content, url);

                    console.log(recipe)
                    response.write(JSON.stringify(recipe));
                    response.end();
                }).catch(error => {
                        response.writeHead(500);
                        response.write("Server Error");
                        console.error(error);
                        response.end();
                    })
            });

        }
    }
});

server.listen(5000);

console.log('Grocery Run Server at port 5000 is running...');