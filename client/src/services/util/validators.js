//checks if input is empty
const isEmpty = (text) => {
    if (text.trim() === '') {
        return true;
    } else {
        return false;
    }
};

//checks if email is an actual email
const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) {
        //the regex above checks that the input is in a proper email format eg user@domain.com
        return true;
    } else {
        return false;
    }
};

exports.validateSignupData = (data) => {
    //validation
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(data.email)) {
        errors.email = 'Must be a valid email address';
    }
    if (isEmpty(data.password)) {
        errors.password = 'Must not be empty';
    }
    if (isEmpty(data.confirmPassword)) {
        errors.confirmPassword = 'Must not be empty';
    }
    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'passwords must match';
    }
    if (isEmpty(data.handle)) {
        errors.handle = 'Must not be empty';
    } //returns all the errors that can be caught through validation
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    }; //if there are no errors valid is true else valid is false
};

exports.validateLoginData = (data) => {
    //validation
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = 'Must not be empty';
    }
    if (isEmpty(data.password)) {
        errors.password = 'Must not be empty';
    } //returns all the errors that can be caught through validation

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    }; //if there are no errors valid is true else valid is false
};
