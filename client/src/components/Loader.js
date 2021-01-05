import React, { Component } from 'react'; //imports react and the component element from react
import './../styles/loader.css'; //imports the specific styles for the loading animation

export class Loader extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="LoaderBalls" style={{ width: this.props.size }}>
                <div style={{ width: this.props.ball, height: this.props.ball }} className="LoaderBalls__item" id="LoaderBalls1"></div>
                <div style={{ width: this.props.ball, height: this.props.ball }} className="LoaderBalls__item" id="LoaderBalls2"></div>
                <div style={{ width: this.props.ball, height: this.props.ball }} className="LoaderBalls__item" id="LoaderBalls3"></div>
                {/*Each ball is given a size and the loader width is given*/}
            </div>
        );
    }
}

export default Loader;
