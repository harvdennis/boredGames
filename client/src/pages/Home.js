import React, { Component } from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';

export class Home extends Component {
    render() {
        return (
            <div className="background">
                <div className="conatain">
                    <h1 className="title">boredGames</h1>
                    <Link to="/login" className="buttn" id="log">
                        Login
                    </Link>
                    <Link to="/signup" className="buttn" id="sign">
                        Sign Up
                    </Link>
                </div>
            </div>
        );
    }
}

export default Home;
