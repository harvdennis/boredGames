import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import './../chessboard.css';

export class ChessPeice extends Component {
    render() {
        return (
            <Draggable key={this.props.id} draggableId={'' + this.props.id + ''} index={this.props.id}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="draggable-area">
                        <img onClick={this.props.getPeice} id={this.props.id} src={this.props.img} className="peice" alt="peice" />
                    </div>
                )}
            </Draggable>
        );
    }
}

export default ChessPeice;
