import React, { Component } from 'react';
import './../styles/form.css';
import Loader from './../components/Loader';
import bishop from '../styles/Bishop.svg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { signupUser } from '../redux/actions/userActions';

export class signup extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            handle: '',
            loading: false,
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
        this.setState({
            loading: true,
        });
        const userData = {
            email: this.state.email,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword,
            handle: this.state.handle,
        };
        this.props.signupUser(userData, this.props.history);
    };

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };
    render() {
        const { classes } = this.props;
        const { loading, errors } = this.state;
        return (
            <div className="log-sign">
                <h1 className="log-title">boredGames</h1>
                <div className="form-contain">
                    <img src={bishop} className="bishop" />
                    <form noValidate onSubmit={this.handleSubmit}>
                        <h3 className="form-title">Sign Up</h3>
                        <div className={errors.email || errors.general ? 'error field' : 'field'}>
                            <input value={this.state.email} id="email" type="email" name="email" className="input" placeholder=" " onChange={this.handleChange} />
                            <label htmlFor="email" className="label">
                                Email
                            </label>
                        </div>
                        <p className="errors error">{errors.email}</p>
                        <div className="field" className={errors.password || errors.general ? 'error field' : 'field'}>
                            <input value={this.state.password} id="password" type="password" name="password" className="input" placeholder=" " onChange={this.handleChange} />
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                        </div>
                        <p className="errors error">{errors.password}</p>
                        <div className={errors.confirmPassword || errors.general ? 'error field' : 'field'}>
                            <input
                                value={this.state.confirmPassword}
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                className="input"
                                placeholder=" "
                                onChange={this.handleChange}
                            />
                            <label htmlFor="password" className="label">
                                Confirm Password
                            </label>
                        </div>
                        <p className="errors error">{errors.confirmPassword}</p>
                        <div className={errors.handle || errors.general ? 'error field' : 'field'}>
                            <input value={this.state.handle} id="handle" type="text" name="handle" className="input" placeholder=" " onChange={this.handleChange} maxlength="12" />
                            <label htmlFor="username" className="label">
                                Username
                            </label>
                        </div>
                        <p className="errors error">{errors.handle}</p>
                        <p className="errors error">{errors.general}</p>
                        <button type="submit" className="submit">
                            Submit
                        </button>
                        <p className="authSwitch">
                            already have an accout?{' '}
                            <Link to="/login" className="footerLink">
                                Login
                            </Link>
                        </p>
                        {this.props.UI.loading && <Loader size="75px" ball="15px" />}
                    </form>
                </div>
            </div>
        );
    }
}

signup.propTypes = {
    signupUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI,
});

const mapActionsToProps = {
    signupUser,
};

export default connect(mapStateToProps, { signupUser })(signup);
