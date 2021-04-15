import React from "react";
import './RecipeGroceriesDisplay.css'

export default function RecipeGroceriesDisplay(props) {
    if (props.recipes.length > 1) {
        return (
            <div className={"GroceryList"}>
                <h3>Recipes</h3>
                {props.recipes.map((recipe, recipeIndex) => (
                    <ul key={"recipe"-recipeIndex}>
                        <a href={recipe.url} key={"recipe"-recipeIndex}>{recipe.title}</a>
                    </ul>
                ))}
                <h3>Groceries</h3>
                {props.recipes.map((recipe, recipeIndex) => (
                    <div>
                        {recipe.ingredients.map((ingredient, ingredientIndex) => (
                            <ul key={"ingredient"-ingredientIndex}>
                                <input type="checkbox" id={ingredientIndex} name={ingredientIndex} value={ingredient}/>
                                <label htmlFor={ingredientIndex}>{ingredient}</label>
                            </ul>
                        ))}
                    </div>
                ))}
            </div>
        )
    } else {
        return null;
    }
}