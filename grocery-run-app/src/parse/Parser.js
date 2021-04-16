import bag from '../bag.svg';
import React from 'react';
import './Parser.css';

class Parser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            proxyServer: 'http://localhost:5000/recipe',
            url: 'https://smittenkitchen.com/2020/06/whole-lemon-meringue-pie-bars/',
            recipes: [{
                title: '',
                url: '',
                ingredients: []
            }],
            errorMessage: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit = () => {
        let data = {
            "url": this.state.url
        }
        fetch(this.state.proxyServer, {
            method: 'POST',
            // mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(data => {
                console.log("Raw text: " + data);
                this.setState(state => {
                    const recipes = state.recipes.concat(data);
                    return {recipes}
                })
            })
            .catch(error => {
                console.error("Error parsing data: " + error);
                if (error.status === 500) {
                    this.setState({errorMessage: "Server unavailable."})
                }
            })
    }

    render() {
        return (
            <div className="Parser">
                <header className="Parser-header">
                    <img src={bag} className="Bag-logo" alt="grocery bag" />
                    <h3>Enter your website here</h3>
                    <textarea
                        className={"text-area-input"}
                        id={"website-content"}
                        onChange={this.handleChange}
                        defaultValue={this.state.url}
                    />
                    <button
                        id={"fetch-recipe"}
                        onClick={this.onSubmit}>
                        Fetch Recipe
                    </button>
                    {this.state.errorMessage? (<div className="errorMessage">{this.state.errorMessage}</div>) : (<div></div>)}

                    <div className={"GroceryList"}>
                        <h3>Recipes</h3>
                        {this.state.recipes.map((recipe, recipeIndex) => (
                            <a href={recipe.url} key={"recipe"-recipeIndex}>{recipe.title}</a>
                        ))}
                        <h3>Groceries</h3>
                            <div>
                                {recipe.ingredients.map((ingredient, ingredientIndex) => (
                                    <div>

                                        <ul key={"ingredient"-ingredientIndex}>
                                            <input type="checkbox" id={ingredientIndex} name={ingredientIndex} value={ingredient}/>
                                            <label htmlFor={ingredientIndex}>{ingredient}</label>
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </header>
            </div>
        )
    }

    handleChange(e) {
        this.setState({ url: e.target.value });
    }


}

export default Parser;