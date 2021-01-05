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
            //checks if new props have loaded
            this.setState({ errors: nextProps.UI.errors }); //sets the new props as the error state variable
        }
    }

    handleSubmit = (e) => {
        e.preventDefault(); //prevents the page from refreshing
        const userData = {
            email: this.state.email,
            password: this.state.password,
        };
        this.props.loginUser(userData, this.props.history); //the redux funtion login user is called with the user data as an argument
    };

    handleChange = (e) => {
        //funtion used to allow inputs to work
        this.setState({
            [e.target.name]: e.target.value, //this funtion is called after every keystroke and updates the value of each input
        });
    };

    render() {
        const { errors } = this.state; //errors are taken from the state
        return (
            <div className="log-sign">
                <h1 className="log-title">boredGames</h1>
                <div className="form-contain">
                    <img src={bishop} className="bishop" />
                    <form noValidate onSubmit={this.handleSubmit}>
                        <h3 className="form-title">Login</h3>
                        <div className={errors.email || errors.general ? 'error field' : 'field'}>
                            <input value={this.state.email} id="email" type="email" name="email" className="input" placeholder=" " onChange={this.handleChange} />
                            {/*email input*/}
                            <label htmlFor="email" className="label">
                                Email
                            </label>
                        </div>
                        <p className="errors error">{errors.email}</p>
                        {/*errors are displayed if any*/}
                        <div className={errors.password || errors.general ? 'error field' : 'field'}>
                            <input value={this.state.password} id="password" type="password" name="password" className="input" placeholder=" " onChange={this.handleChange} />
                            {/*password input*/}
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                        </div>
                        <p className="errors error">{errors.password}</p>
                        {/*errors are displayed if any*/}
                        <p className="errors error">{errors.general}</p>
                        <button type="submit" className="submit">
                            Submit
                        </button>
                        <p className="authSwitch">
                            don't have an account?{' '}
                            <Link to="/signup" className="footerLink">
                                {/*link to the signup page*/}
                                Signup
                            </Link>
                        </p>
                        {this.props.UI.loading && <Loader size="75px" ball="15px" />}
                        {/*loading animation displayed if loading*/}
                    </form>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    //maps the redux state to the components props
    loginUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    //defines the types of each prop so no unwanted errors occur
    user: state.user,
    UI: state.UI,
});

export default connect(mapStateToProps, { loginUser })(Login); //connect links react and redux together so they can be used together
