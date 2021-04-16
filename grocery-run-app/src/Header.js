import React, { PureComponent } from "react";
import "./Header.css"
import bag from "./bag.svg";

export default class Header extends PureComponent {
    render() {
        return (
            <header className="component-header">
                <img src={bag} className="Bag-logo" alt="grocery bag" />
                <h4>Enter the website for your recipe below</h4>
            </header>
        );
    }
}