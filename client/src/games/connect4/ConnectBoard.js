import React, { Component } from 'react';
import './connectboard.css';

export class ConnectBoard extends Component {
    render() {
        var board = this.props.currentBoard;
        if (board === null) {
            board = [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ];
        }
        let panels = [];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 6; j++) {
                if (board[i][j] === 0) {
                    panels.push(
                        <div key={j + i * 7} location={`${i}-${j}`} className="panel">
                            <div className="disc"></div>
                        </div>
                    );
                }
                if (board[i][j] === 1) {
                    panels.push(
                        <div key={j + i * 7} location={`${i}-${j}`} className="panel">
                            <div className="disc-red"></div>
                        </div>
                    );
                }
                if (board[i][j] === 2) {
                    panels.push(
                        <div key={j + i * 7} location={`${i}-${j}`} className="panel">
                            <div className="disc-yellow"></div>
                        </div>
                    );
                }
            }
        }
        return <div className="connectboard">{panels}</div>;
    }
}

export default ConnectBoard;
