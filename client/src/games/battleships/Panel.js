import React, { Component } from 'react'; //react and the react component is imported from the react library
import { Droppable } from 'react-beautiful-dnd'; //droppable component is imported from the react drag and drop library

export class Panel extends Component {
    render() {
        return (
            <Droppable droppableId={`${this.props.location}`}>
                {/*id is give through props*/}
                {(provided, snapshot) => (
                    <div id={this.props.location} className={`shipPanel`}>
                        <div
                            ref={provided.innerRef}
                            className={snapshot.isDraggingOver ? 'highlighted' : ''}
                            style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: this.props.color }}
                        >
                            {/*panel is highlighted if something is dragged over it*/}
                            {this.props.children}
                            {provided.placeholder}
                        </div>
                    </div>
                )}
                {/*The react drag and drop need this special format for it to work I found out how to do this from the documentation */}
            </Droppable>
        );
    }
}

export default Panel; //The panel is exported
