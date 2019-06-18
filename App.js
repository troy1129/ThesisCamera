import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View, StatusBar, PermissionsAndroid,Alert
} from 'react-native';

import Volunteer from './src/components/Volunteer';
import RegularUser from './src/components/RegularUser';
import Responder from './src/components/Responder';
import LoadingScreen from './src/components/LoadingScreen';
import Login from './src/components/Login';
import Register from './src/components/Register';
import OpenAppSettings from 'react-native-app-settings'
import 'babel-polyfill';
import 'es6-symbol'
import { YellowBox } from 'react-native';
import _ from 'lodash';
import app from './src/config/fire';
import fire2 from './src/config/fire'

import { Actions, Scene, Router, Stack } from 'react-native-router-flux';
import changeDetails from './src/components/changeDetails';
console.reportErrorsAsExceptions = false;
YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf("Setting a timer") <= -1) {
    _console.warn(message);
  }
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      userId: "",
      isVerified: false,
      userType: [],
      userAccount: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        user_type: '',
        isMobile: null,
        contactNumber: ''
      }
    };
  }

  componentDidMount() {
    this.authListener();
    this.askUserGPSPermission();
  }

  

  askUserGPSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Persistence',
          message:
            'Tabang! application needs access to your location',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can user user location');
      }
      else if (granted===PermissionsAndroid.RESULTS.DENIED) {
        this.askUserGPSPermission()
      }
      else
      { 
        Alert.alert(
        "Location is not Permitted",
        `Turn on Location Permissions in Setting`
        ,
        [
          { text: "Ok", onPress: () => {OpenAppSettings.open()}}

        ],
        
        { cancelable: false }
      );
      this.setState({dummy:1});

      }
    }
    catch (error) {
      console.log(error);
    }
  }
  authListener() {
    app.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ user, userId: user.uid });
        this.userDetails();
      } else {
        setTimeout(() => Actions.Login(), 1500);
        this.setState({ user: null, userId: null });
      }
    });

  }

  componentWillUnmount()
  {
    this.authListener()
    console.log('asdf')
  }
  
  signOutUser() {
    app.auth().signOut().then(function () {
        // Sign-out successful.

        console.log("SUCCESFULL LOG OUT");

    }).catch(function (error) {
        // An error happened.
        console.log(error);
    });

}
  userDetails = () => {
    let userValue = "";
    console.log("userr", this.state.userId);
    app.database().ref(`users/${this.state.userId}`).once("value").then(snapshot => {
      userValue = snapshot.val();
      // console.log("uservalues", userValue);
      console.log("user values", userValue);
      this.setState({ userType: userValue.user_type, isVerified: userValue.isVerified });
      this.setState({ userAccount: userValue });
      // if (fire2.auth().currentUser.emailVerified===false)
      // {
      //   alert(JSON.stringify(fire2.auth().currentUser.emailVerified))
      //   this.setState({ user: null, userId: null, userAccount: null, isVerified: false, userType: false });
      //   console.log("user not verified");
      //   Alert.alert(
      //     "Email Address is not Verified",
      //     `Check Email Address for Verification Email`
      //     ,
      //     [
      //       { text: "Ok", onPress: () => { this.signOutUser() } },
      //     ],
      //     { cancelable: false }
      //   );

      // }
      // else if (fire2.auth().currentUser.emailVerified===true && this.state.isVerified===false)
      // {
      //     fire2.database().ref('unverifiedMobileUsers/' + this.state.userId).update({
      //       user_type: this.state.userType,
      //   })
        
      // }
      if (this.state.isVerified === true) {
        this.rerouteUserAccess();
      } 
      else {
        this.setState({ user: null, userId: null, userAccount: null, isVerified: false, userType: false });
        console.log("user not verified");
        Alert.alert(
          "User is not verified",
          `Command center must verify user`
          ,
          [
            { text: "Ok", onPress: () => { this.signOutUser() } },
          ],
          { cancelable: false }
        );

      }

      // this.props.logUser(this.state.userAccount);
    }).catch(err => console.log(err));

  }


  rerouteUserAccess = () => {
    // console.log("thisss", this.state.userType);
    switch (this.state.userType) {
      case 'Regular User':
        // console.log('Regular User');
        Actions.RegularUser();
        // browserHistory.push('/administrator');
        //this.props.logUser();
        break;
      case 'Responder':
        // console.log('Responder');
        // browserHistory.push('/ccpersonnel');
        Actions.Responder();
        break;
      case 'Volunteer':
        // console.log('Volunteer');
        Actions.Volunteer();
        // browserHistory.push('/ccpersonnel');
        break;
      default: Actions.login();
        break;
    }
  }

  Volunteer() {
    Actions.userMap();
  }

  render() {
    return (
      <View style={styles.container}>
        <Router>
          <Stack key="root" hideNavBar={true}>
            <Scene key="loading" component={LoadingScreen} initial={true} title="Loading" />
            <Scene key="Login" component={Login} title="Login" />
            <Scene key="signup" component={Register} title="Register" />
            <Scene key="RegularUser" component={RegularUser} title="RegularUser" />
            <Scene key="Volunteer" component={Volunteer} title="Volunteer" />
            <Scene key="Responder" component={Responder} title="Responder" />
            <Scene key="changeDetails" component={changeDetails} title="changeDetails" />
          </Stack>
        </Router>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1

    // alignItems: 'center',
    // backgroundColor: '#455a64',
  }
});