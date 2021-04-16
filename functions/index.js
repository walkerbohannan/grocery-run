const functions = require("firebase-functions");
const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const server = express();

server.get("/", (req, response) => {
  response.send(
      "<html>" +
        "<body>" +
          "<h3>Grocery Run Server Homepage</h3>"+
        "</body>"+
      "</html>");
});

server.post("/recipe", (request, response) => {
  console.log("Processing recipe...\n");
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", () => {
    const url = processRecipeUrl(body);
    console.log(">> URL:" + url + " <<");

    getRecipeContent(url).then((content) => {
      response.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      const recipe = constructRecipeIngredients(content, url);

      console.log(recipe);
      response.write(JSON.stringify(recipe));
      response.end();
    }).catch((error) => {
      response.writeHead(500);
      response.write("Server Error");
      console.error(error);
      response.end();
    });
  });
});

server.options("/recipe", (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Request-Method", "*");
  response.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  response.setHeader("Access-Control-Allow-Headers", "*");
  response.writeHead(200);
  response.end();
});

exports.server = functions.https.onRequest(server);

/**
 * @param {string} body
 * @return {string} url
 */
function processRecipeUrl(body) {
  if (body !== "") {
    const bodyObject = JSON.parse(body);
    const url = bodyObject.url;
    if (bodyObject && url) {
      console.log(url);
      return url;
    }
  } else {
    return "Could not process recipe: URL not found.";
  }
}

/**
 * @param {*} url
 * @return {string} html string
 */
async function getRecipeContent(url) {
  const response = await fetch(url);
  return await response.text();
}

/**
 * @param {cheerio.Root | jQuery | HTMLElement} $
 * @return {array} ingredients
 */
function findHalfBakedHarvestIngredients($) {
  const wprmRecipeIngredients = $(".wprm-recipe-ingredients");
  const ingredients = [];
  for (let i = 0; i < wprmRecipeIngredients.length; i++) {
    const recipeIngredientsChildren = wprmRecipeIngredients[i].children;
    for (let j = 0; j < recipeIngredientsChildren.length; j++) {
      const recipeIngredientsChild = recipeIngredientsChildren[j];
      if (recipeIngredientsChild.type === "tag") {
        let ingredient = "";
        for (let k = 0; k < recipeIngredientsChild.children.length; k++) {
          const child = recipeIngredientsChild.children[k];
          if (child.type === "tag") {
            const firstChild = child.children[0];
            if (child.attribs.class === "wprm-recipe-ingredient-amount") {
              ingredient += firstChild.data + " ";
            } else if (child.attribs.class === "wprm-recipe-ingredient-unit") {
              ingredient += firstChild.data + " ";
            } else if (child.attribs.class === "wprm-recipe-ingredient-name") {
              if (firstChild.type === "tag" && firstChild.name === "a") {
                ingredient += firstChild.children[0].data;
              } else {
                ingredient += firstChild.data + "";
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

/**
 * @param {cheerio.Root | jQuery | HTMLElement} $
 * @return {[]} ingredients
 */
function findAllRecipesIngredients($) {
  const ingredients = $(".ingredients-item-name");
  const recipeIngredients = [];
  for (let index = 0; index < ingredients.length; index++) {
    recipeIngredients.push(ingredients[index].children[0].data);
  }
  return recipeIngredients;
}

/**
 * @param {cheerio.Root | jQuery | HTMLElement} $
 * @return {[]} ingredients
 */
function findSmittenKitchenIngredients($) {
  const ingredients = $(".ingredient");
  const recipeIngredients = [];
  for (let index = 0; index < ingredients.length; index++) {
    recipeIngredients.push(ingredients[index].children[0].data);
  }
  return recipeIngredients;
}

/**
 * @param {cheerio.Root | jQuery | HTMLElement} $
 * @return {[]} ingredients
 */
function findBonAppetitIngredients($) {
  const parsedIngredients = [];
  const recipeIngredientList = $(".recipe__ingredient-list");

  if (recipeIngredientList === null || recipeIngredientList.length === 0) {
    return parsedIngredients;
  }

  const ingredientList = recipeIngredientList[0].children;
  ingredientList.forEach((i) => {
    if (i.type === "tag" && i.name === "div") {
      const ingredients = i.children;
      let ingredientName = "";
      for (let index = 0; index < ingredients.length; index++) {
        if (ingredients[index].name === "p") {
          const amount = ingredients[index].children.length > 0 ?
              ingredients[index].children[0].data.trim() :
              "";
          ingredientName = amount + " ";
        } else if (ingredients[index].name === "div") {
          ingredientName+=ingredients[index].children[0].data;
          parsedIngredients.push(ingredientName);
          ingredientName = "";
        }
      }
    }
  });
  return parsedIngredients;
}

/**
 * @param {cheerio.Root | jQuery | HTMLElement} $
 * @return {[]} ingredients
 */
function findNyTimesIngredients($) {
  const parsedIngredients = [];
  const recipeIngredientsObject = $(".recipe-ingredients");
  if (recipeIngredientsObject.length > 0) {
    for (let i = 0; i < recipeIngredientsObject.length; i++) {
      const children = recipeIngredientsObject[i].children;
      for (let j = 0; j < children.length; j++) {
        const child = children[j];
        let parsedIngredient = "";
        if (child.type === "tag") {
          for (let k = 0; k < child.children.length; k++) {
            if (child.children[k].type === "tag") {
              parsedIngredient+=child.children[k].children[0].data.trim() + " ";
            }

            if (k % 3 === 0) {
              if (parsedIngredient !== "") {
                parsedIngredients.push(parsedIngredient.trim());
              }
              parsedIngredient = "";
            }
          }
        }
      }
    }
  } else {
    if (recipeIngredientsObject.children.length === 0) {
      return parsedIngredients;
    }
  }
  return parsedIngredients;
}

/**
 * @param {*} content
 * @param {*} url
 * @return {{}} recipe
 */
function constructRecipeIngredients(content, url) {
  const $ = cheerio.load(content);
  let ingredients = findSmittenKitchenIngredients($);
  if (ingredients.length === 0) {
    ingredients = findAllRecipesIngredients($);
  }

  if (ingredients.length === 0) {
    ingredients = findHalfBakedHarvestIngredients($);
  }

  if (ingredients.length === 0) {
    ingredients = findBonAppetitIngredients($);
  }

  if (ingredients.length === 0) {
    ingredients = findNyTimesIngredients($);
  }

  const recipe = {};
  recipe.title = $("title")[0].children[0].data;
  recipe.url = url;
  recipe.ingredients = ingredients;
  return recipe;
}


