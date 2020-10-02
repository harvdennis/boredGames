import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const AuthedRoute = ({ component: Component, authenticated, ...rest }) => (
    <Route {...rest} render={(props) => (authenticated === false ? <Redirect to="/" /> : <Component {...props} />)} />
);

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated,
});

AuthedRoute.propTypes = {
    user: PropTypes.object,
};

export default connect(mapStateToProps)(AuthedRoute);
