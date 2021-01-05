import React, { Component } from 'react'; //react and the react component is imported from the react library
import { Draggable } from 'react-beautiful-dnd'; //draggable component is imported from the react drag and drop library

export class Ship extends Component {
    constructor() {
        super();
        this.state = {
            angle: false, //used to tell if the ship is rotated
        };
    }
    render() {
        const rotate = () => {
            this.setState({ angle: !this.state.angle }); //inverts the value of rotation
        };
        let parts = [];
        for (let i = 0; i < this.props.length; i++) {
            //depending on the length of the ship the parts of the ship are assebled
            parts.push(
                <div key={i} num={i} className="part">
                    <div key={i} className="partInner"></div>
                </div>
            );
        }
        return (
            <Draggable key={this.props.index} id={this.props.id} draggableId={this.props.id} index={this.props.index}>
                {/*This is needed to create the ship draggable*/}
                {(provided) => (
                    <div
                        id={this.props.id}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={this.state.angle ? 'rotated ship' : 'ship'}
                        onClick={() => {
                            rotate(); //when clicked the ship rotates
                            this.props.checkRotate(this.props.id);
                        }}
                    >
                        {parts}
                    </div>
                )}
            </Draggable>
        );
    }
}

export default Ship;
