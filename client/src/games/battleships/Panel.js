import React, { Component } from 'react';
import { Droppable } from 'react-beautiful-dnd';

export class Panel extends Component {
    render() {
        return (
            <Droppable droppableId={`${this.props.location}`}>
                {(provided, snapshot) => (
                    <div id={this.props.location} className={`shipPanel`}>
                        <div
                            ref={provided.innerRef}
                            className={snapshot.isDraggingOver ? 'highlighted' : ''}
                            style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: this.props.color }}
                        >
                            {this.props.children}
                            {provided.placeholder}
                        </div>
                    </div>
                )}
            </Droppable>
        );
    }
}

export default Panel;
