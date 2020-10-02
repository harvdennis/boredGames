import React, { Component } from 'react';
import './../styles/loader.css';

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
            </div>
        );
    }
}

export default Loader;
