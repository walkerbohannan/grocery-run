import './App.css';
import React, { PureComponent } from "react";
import Header from "./Header"
import RecipeSearch from "./RecipeSearch"

export default class App extends PureComponent {
  render() {
    return (
        <div>
          <Header />
          <RecipeSearch />
        </div>
    )
  }
}
