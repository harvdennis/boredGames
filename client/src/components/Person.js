import React, { Component } from 'react';

export class Person extends Component {
    constructor(props) {
        super(props);
        this.state = {
            credentials: {},
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.friends) {
            this.setState({ credentials: nextProps.friends });
        }
    }

    render() {
        return <div></div>;
    }
}

export default Person;
