import * as firebase from 'firebase'; //imports firbase

let config = {
    apiKey: 'api key',
    authDomain: 'authDomain',
    databaseURL: 'databaseURL',
    projectId: 'projectId',
    storageBucket: 'storageBucket',
    messagingSenderId: 'messagingSenderId',
    appId: 'appId',
    measurementId: 'measurementId',
}; //configures firebase so it can connect with the correct database

firebase.initializeApp(config); //initialises firebase

export default firebase;
