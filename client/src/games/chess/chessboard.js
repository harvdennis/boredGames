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

import React, { Component } from 'react';
import Panel from './../game_util/panel';
import { DragDropContext } from 'react-beautiful-dnd';
import ChessPeice from './peices/ChessPeice';

import './chessboard.css';

export class Chessboard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let board = this.props.currentFen;
        if (board === null) {
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
            }
        }

        const panels = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const black = (j + i) % 2 === 1;
                let empty = parseInt(board[i][j]);
                if (!isNaN(empty)) {
                    panels.push(<Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}></Panel>);
                } else {
                    if (board[i][j] === 'P') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wp} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'p') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bp} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'R') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wr} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'r') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={br} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'N') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wn} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'n') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bn} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'B') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wb} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'b') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bb} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'Q') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wq} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'q') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bq} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'K') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={wk} />
                            </Panel>
                        );
                    } else if (board[i][j] === 'k') {
                        panels.push(
                            <Panel key={j + i * 8} onMove={this.props.onMove} location={`${j}-${i}`} black={black}>
                                <ChessPeice id={j + i * 8} getPeice={this.props.getPeice} img={bk} />
                            </Panel>
                        );
                    }
                }
            }
        }
        return (
            <DragDropContext onDragEnd={this.props.handleDrag}>
                <div className={`chessboard ${this.props.player}`}>{panels}</div>
            </DragDropContext>
        );
    }
}

export default Chessboard;
