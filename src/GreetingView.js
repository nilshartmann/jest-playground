import React from 'react';

import {loadFromServer} from './backend';

export default class GreetingView extends React.Component {

    render() {
        if (!this.state) {
            return <p>No Greeting yet</p>;
        }

        return <h1>{this.state.greeting}</h1>;
    }

    componentDidMount() {
        loadFromServer(greeting => this.setState({greeting}))
    }
}