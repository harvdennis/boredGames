import React, { Component } from 'react'; // react and the react component are imported from the react library
import { Droppable } from 'react-beautiful-dnd'; //Droppable is imported from react drag and drop library
import './panel.css'; //panel styles are imported

export class Panel extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const fill = this.props.black ? 'silver' : 'white'; //depending on the on the black prop the panel either has a white or silver colour

        return (
            <Droppable droppableId={`${this.props.location}`}>
                {/*Panel is wrapped in droppable to make it droppable*/}
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
