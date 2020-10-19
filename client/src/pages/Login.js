import React, { Component } from 'react';
import './../styles/form.css';
import './../styles/Sign-Log.css';
import Loader from './../components/Loader';
import bishop from '../styles/Bishop.svg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { loginUser } from '../redux/actions/userActions';

export class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            errors: {},
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.UI.errors) {
            this.setState({ errors: nextProps.UI.errors });
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        const userData = {
            email: this.state.email,
            password: this.state.password,
        };
        this.props.loginUser(userData, this.props.history);
    };

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    render() {
        const {
            UI: { loading },
        } = this.props;
        const { errors } = this.state;
        return (
            <div className="log-sign">
                <h1 className="log-title">boredGames</h1>
                <div className="form-contain">
                    <img src={bishop} className="bishop" />
                    <form noValidate onSubmit={this.handleSubmit}>
                        <h3 className="form-title">Login</h3>
                        <div className={errors.email || errors.general ? 'error field' : 'field'}>
                            <input value={this.state.email} id="email" type="email" name="email" className="input" placeholder=" " onChange={this.handleChange} />
                            <label htmlFor="email" className="label">
                                Email
                            </label>
                        </div>
                        <p className="errors error">{errors.email}</p>
                        <div className={errors.password || errors.general ? 'error field' : 'field'}>
                            <input value={this.state.password} id="password" type="password" name="password" className="input" placeholder=" " onChange={this.handleChange} />
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                        </div>
                        <p className="errors error">{errors.password}</p>
                        <p className="errors error">{errors.general}</p>
                        <button type="submit" className="submit">
                            Submit
                        </button>
                        <p className="authSwitch">
                            don't have an account?{' '}
                            <Link to="/signup" className="footerLink">
                                Signup
                            </Link>
                        </p>
                        {this.props.UI.loading && <Loader size="75px" ball="15px" />}
                    </form>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI,
});

export default connect(mapStateToProps, { loginUser })(Login);
