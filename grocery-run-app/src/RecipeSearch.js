import React, { PureComponent } from "react";
import RecipeGroceriesDisplay from "./RecipeGroceriesDisplay"
import StatusMessage from "./StatusMessage"

import "./RecipeSearch.css";

export default class RecipeSearch extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            proxyServer: 'https://us-central1-grocery-run-app.cloudfunctions.net/server/recipe',
            url: 'https://smittenkitchen.com/2020/06/whole-lemon-meringue-pie-bars/',
            recipes: [{
                title: '',
                url: '',
                ingredients: []
            }],
            statusMessage: '',
            statusType: 'error'
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
        this.setState({
            statusMessage: 'Parsing out ingredients...'
        })
        fetch(this.state.proxyServer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(data => {
                this.setState(state => {
                    if (data.ingredients.length === 0) {
                        this.setState({
                            statusMessage: "Couldn't parse out ingredients from that link. Maybe bribe the devs to add that website? =)",
                            statusType: 'warn'
                        })
                    } else {
                        this.setState({
                            statusMessage: ''
                        })
                    }
                    const recipes = state.recipes.concat(data);
                    return {recipes}
                })
            })
            .catch(error => {
                console.error("Error parsing data.");
                this.setState({
                    statusMessage: "Couldn't get your ingredients: server unavailable.",
                    statusType: 'error'
                })
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
                <StatusMessage statusMessage={this.state.statusMessage}/>
                <RecipeGroceriesDisplay recipes={this.state.recipes}/>
            </div>
        );
    }
}