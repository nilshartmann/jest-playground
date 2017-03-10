import React from 'react';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    blabla() {

    }

    render() {
        const {onEdit} = this.props;
        const {currentInput} = this.state;

        return <div>
            Eingabe:
            <input type='text' value={currentInput} onChange={this.blabla}/>
        </div>
    }
}
