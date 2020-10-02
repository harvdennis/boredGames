import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Navbar extends Component {
    render() {
        return (
            <nav>
                <ul>
                    <li>
                        <Link to="/games" className="link">
                            Games
                        </Link>
                    </li>
                    <li>
                        <Link to="/app" className="link">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile" className="link">
                            Profile
                        </Link>
                    </li>
                </ul>
            </nav>
        );
    }
}

export default Navbar;
