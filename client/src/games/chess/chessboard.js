import bb from './chess-peices/bb.svg';
import bk from './chess-peices/bk.svg';
import bq from './chess-peices/bq.svg';
import br from './chess-peices/br.svg';
import bn from './chess-peices/bn.svg';
import bp from './chess-peices/bp.svg';
import wb from './chess-peices/wb.svg';
import wk from './chess-peices/wk.svg';
import wq from './chess-peices/wq.svg';
import wr from './chess-peices/wr.svg';
import wn from './chess-peices/wn.svg';
import wp from './chess-peices/wp.svg';
//importing all the peice images

import React, { Component } from 'react'; //importing react and the react component from the react library
import Panel from './../game_util/panel'; // importing panel  component
import { DragDropContext } from 'react-beautiful-dnd'; //importing drag androp context
import ChessPeice from './peices/ChessPeice'; //importing the chess peice component

import './chessboard.css'; //importing the chessboard styles

export class Chessboard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let board = this.props.currentFen;
        if (board === null) {
            //sets the board to empty
            board = ['11111111', '11111111', '11111111', '11111111', '11111111', '11111111', '11111111', '11111111'];
        } else {
            board = board.split('/');
            board[7] = board[7].split(' ')[0];
            for (let i = 0; i < 8; i++) {
                let x = 0;
                for (let j of board[i]) {
                    let panel = parseInt(j);
                    if (!isNaN(panel)) {
                        let val = '1';
                        board[i] = board[i].replace(j, val.repeat(panel));
                        x = x + panel;
                    } else {
                        x++;
                    }
                }
            } //this function turns the inputted fen into an array which models the chessboard
        }

        const panels = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const black = (j + i) % 2 === 1; //alternates for every black square to make a checkerboard pattern
                let empty = parseInt(board[i][j]);
                if (!isNaN(empty)) {
                    panels.push(<Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}></Panel>); //pushes an empty panel to the board
                } else {
                    if (board[i][j] === 'P') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wp} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'p') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bp} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'R') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wr} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'r') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={br} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'N') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wn} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'n') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bn} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'B') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wb} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'b') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bb} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'Q') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wq} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'q') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bq} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'K') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wk} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    } else if (board[i][j] === 'k') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bk} />
                            </Panel>
                        ); //pushes a panel with the corresponding peice
                    }
                }
            }
        }
        return (
            <DragDropContext onDragEnd={this.props.handleDrag}>
                {/*allows for drag and drop to happen*/}
                <div className={`chessboard ${this.props.player}`}>{panels}</div>
                {/*displayes the chessboard*/}
            </DragDropContext>
        );
    }
}

export default Chessboard;
