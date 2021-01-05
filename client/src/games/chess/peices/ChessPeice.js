import React, { Component } from 'react'; //react and the react component is imported from the react library
import { Draggable } from 'react-beautiful-dnd'; // the draggable component from react drag and drop library is imported

import './../chessboard.css'; //chessboard styles imported

export class ChessPeice extends Component {
    render() {
        return (
            <Draggable key={this.props.id} draggableId={'' + this.props.id + ''} index={this.props.id}>
                {/*peice is made draggable*/}
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
