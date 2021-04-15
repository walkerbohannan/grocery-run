import React, { PureComponent } from "react";
import RecipeGroceriesDisplay from "./RecipeGroceriesDisplay"

import "./RecipeSearch.css";

export default class RecipeSearch extends PureComponent {
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

    handleChange(e) {
        this.setState({ url: e.target.value });
    }

    onSubmit = () => {
        let data = {
            "url": this.state.url
        }
        fetch(this.state.proxyServer, {
            method: 'POST',
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
            <div className="component-search">
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
                <RecipeGroceriesDisplay recipes={this.state.recipes}/>
            </div>
        );
    }
}