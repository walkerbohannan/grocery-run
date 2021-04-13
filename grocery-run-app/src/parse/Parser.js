import bag from './bag.svg';
import React from 'react';
import './Parser.css';

class Parser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: 'https://smittenkitchen.com',
            rawText: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
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
                    <div className={"Page-content"}>

                    <h4>Output</h4>
                    <textarea
                        className={"text-area-output"}
                        defaultValue={this.state.rawText}
                    />
                    </div>
                </header>
            </div>
        )
    }

    handleChange(e) {
        this.setState({ url: e.target.value });
    }

    async onSubmit() {
        const response = await fetch(this.state.url);
        const htmlString = await response.text();
        this.setState({
            rawText: htmlString
        })
    }
}

export default Parser;