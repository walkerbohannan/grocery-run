import React from "react";
import './RecipeGroceriesDisplay.css'

export default function RecipeGroceriesDisplay(props) {
    if (props.recipes.length > 1) {
        return (
            <div className={"GroceryList"}>
                <h3>Recipes</h3>
                {props.recipes.map((recipe, recipeIndex) => (
                    <ul key={recipeIndex}>
                        <a href={recipe.url}>{recipe.title}</a>
                    </ul>
                ))}
                <h3>Groceries</h3>
                {props.recipes.map((recipe, recipeIndex) => (
                    <div key={recipeIndex}>
                        {recipe.ingredients.map((ingredient, ingredientIndex) => (
                            <ul key={ingredientIndex}>
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