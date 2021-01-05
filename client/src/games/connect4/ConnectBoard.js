import React, { Component } from 'react'; //react and the react component imported from the react library
import './connectboard.css'; //connect 4 styles are imported

export class ConnectBoard extends Component {
    render() {
        var board = this.props.currentBoard;
        if (board === null) {
            //if there is no props clear the board
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
                //loop through all the spots in the board
                if (board[i][j] === 0) {
                    panels.push(
                        <div key={j + i * 7} location={`${i}-${j}`} className="panel">
                            <div className="disc"></div>
                        </div>
                    ); // if the board array is 0 display an empty space
                }
                if (board[i][j] === 1) {
                    panels.push(
                        <div key={j + i * 7} location={`${i}-${j}`} className="panel">
                            <div className="disc-red"></div>
                        </div>
                    ); // if the board array is 1 display a red disc
                }
                if (board[i][j] === 2) {
                    panels.push(
                        <div key={j + i * 7} location={`${i}-${j}`} className="panel">
                            <div className="disc-yellow"></div>
                        </div>
                    ); //if the array is 2 display a yellow disc
                }
            }
        }
        return <div className="connectboard">{panels}</div>;
        //return the connect board
    }
}

export default ConnectBoard;
