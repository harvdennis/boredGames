import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';

export class Ship extends Component {
    constructor() {
        super();
        this.state = {
            angle: false,
        };
    }
    render() {
        const rotate = () => {
            this.setState({ angle: !this.state.angle });
        };
        let parts = [];
        for (let i = 0; i < this.props.length; i++) {
            parts.push(
                <div key={i} num={i} className="part">
                    <div key={i} className="partInner"></div>
                </div>
            );
        }
        return (
            <Draggable key={this.props.index} id={this.props.id} draggableId={this.props.id} index={this.props.index}>
                {(provided) => (
                    <div
                        id={this.props.id}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={this.state.angle ? 'rotated ship' : 'ship'}
                        onClick={() => {
                            rotate();
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
