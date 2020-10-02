import React, { Component } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import './panel.css';

export class Panel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const fill = this.props.black ? 'silver' : 'white';

        return (
            <Droppable droppableId={`${this.props.location}`}>
                {(provided, snapshot) => (
                    <div onClick={this.props.onMove} id={this.props.location} className={`chessPanel ${fill}`}>
                        <div ref={provided.innerRef} className={snapshot.isDraggingOver ? 'highlighted' : ''} style={{ position: 'absolute', height: '100%', width: '100%' }}>
                            {provided.placeholder}
                        </div>
                        <div className="peice-container">{this.props.children}</div>
                    </div>
                )}
            </Droppable>
        );
    }
}

export default Panel;
