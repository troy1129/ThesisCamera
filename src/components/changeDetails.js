import React, { Component } from "react";
import {
Text, TouchableOpacity, View, TextInput, StyleSheet, 
TouchableHighlight, Keyboard, Alert
} from "react-native";
import { Thumbnail, List, ListItem, Separator } from 'native-base';
import ActionButton, { ActionButtonItem } from 'react-native-action-button';
import AwesomeButton from 'react-native-really-awesome-button';
import Button from 'react-native-button'
import 'babel-polyfill';
import 'es6-symbol';
import app from '../config/fire';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import {fireAuth} from '../config/fire'
import { Formik } from 'formik'
import * as yup from 'yup'
export default class changeDetails extends Component
{

constructor(props)
{
    super(props);
    this.state= {
        newPassword:'',
        currentPassword:'',
        confirmNewPassword:'',
        firstName:'',
        lastName:'',
        userId:app.auth().currentUser.uid,
        email:app.auth().currentUser.email,
    }
}


signOut = () => {
  app.auth().signOut().then(function () {
    // Sign-out successful.

    console.log("SUCCESFULL LOG OUT");

}).catch(function (error) {
    // An error happened.
    console.log(error);
})
}

componentDidMount()
{
  this.getUserInfo();

}

getUserInfo = () => {
  var userType = '';
  var firstName = '';
  var lastName = '';
  var that = this;
  console.log("HI", this.state.userId);
  this.user2 = app.database().ref(`users/${this.state.userId}/`);
  this.user2.once('value', function (snapshot) {
      const data2 = snapshot.val() || null;
      console.log("data2", data2);

      if (data2) {
          userType = data2.user_type;
          firstName = data2.firstName;
          lastName = data2.lastName;
      }

      that.setState({ userType, firstName, lastName });
      // app.database().ref(`mobileUsers/Responder/${that.state.userId}`).update({
      //     incidentID: '',
      //     isAccepted: false,
      // })

  })


}


doSendEmailVerification = () =>{
  app.auth().currentUser.sendEmailVerification()
  }

reAuthPassword = (currentPassword) =>
{
    var user=app.auth().currentUser
    var cred=fireAuth.auth.EmailAuthProvider.credential(user.email,currentPassword)
    return user.reauthenticateWithCredential(cred)
    
}
reAuthEmail= (currentPasswordEmail) =>
{
    var user=app.auth().currentUser
    var cred=fireAuth.auth.EmailAuthProvider.credential(user.email,currentPasswordEmail)
    return user.reauthenticateWithCredential(cred)
    
}

onChangeEmail = (values) =>
{
    var currentPasswordEmail=values.currentPasswordEmail
    var email=values.email
    this.reAuthEmail(currentPasswordEmail).then(()=>{
        app.auth().currentUser.updateEmail(email).then(()=>{
            app.database().ref(`users/${app.auth().currentUser.uid}`).update({
                email:email
            }).then(
              Alert.alert(
                'Account Details',
                'Your Email has been Changed!',
                [
                  { text: 'Ok ', onPress: ()=>this.signOut()}
                ],
                {cancelable: false},
              )
            ).then(this.doSendEmailVerification()
            )
        }).catch((error)=>{
            alert(JSON.stringify(error))
        
        })
        }).catch((errorAuth)=>{
            alert(JSON.stringify(errorAuth))
        })
    
}



onChangePassword =(values)=>
{
var currentPassword=values.currentPassword
var newPassword=values.newPassword
this.reAuthPassword(currentPassword).then(()=>{
    app.auth().currentUser.updatePassword(newPassword).then(()=>{
        app.database().ref(`users/${app.auth().currentUser.uid}`).update({
            password:newPassword
        }).then(
          Alert.alert(
            'Account Details',
            'Password has been changed!',
            [
              { text: 'Ok ', onPress: ()=>this.signOut()}
            ],
            {cancelable: false},
          )
        )
    }).catch((error)=>{
        alert(JSON.stringify(error))
    
    })
    }).catch((errorAuth)=>{
        alert(JSON.stringify(errorAuth))
    })


}

onChangeDetails = (values) =>
{
    var firstName=values.firstName
    var lastName=values.lastName
  app.database().ref(`users/${this.state.userId}/`).update(
    {
      firstName:firstName,
      lastName:lastName
    }
  ).then(
      alert("Your Details have been Changed!") 
  )
}

checkState=()=>
{
    alert(JSON.stringify(this.state.firstName))
}
render()
{
    return(
        <View style={styles.container} >
        <Formik initialValues={{ newPassword: '',currentPassword:'',confirmNewPassword:''}}
        onSubmit={values => {
          this.onChangePassword(values);
        
        }}
        validationSchema={
          yup.object().shape({
            // email: yup
            //   .string()
            //   .email('Invalid Email Format')
            //   .required('Email Address is Required'),
            currentPassword: yup
              .string()
              .strict(true)
              // .matches( /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/, 'Password must be 8 characters long and contain One(1) Lower Case Letter, Upper Case Letter, Number, and Special Character.')              .trim('Password contains Special Characters')
              .required('Enter Current Password'),
              newPassword: yup
              .string()
              .strict(true)
              // .matches( /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/, 'Password must be 8 characters long and contain One(1) Lower Case Letter, Upper Case Letter, Number, and Special Character.')              .trim('Name cannot contain Special Characters or Numbers')
              .required('Password is Required'),
              confirmNewPassword: yup
              .string()
              .strict(true)
              // .matches( /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/, 'Password must be 8 characters long and contain One(1) Lower Case Letter, Upper Case Letter, Number, and Special Character.')              .trim('Name cannot contain Special Characters or Numbers')
              .required('You Must Confirm Password')
              .when("newPassword", {
                  is: val => (val && val.length > 0 ? true : false),
                  then: yup.string().oneOf(
                      [yup.ref("newPassword")],
                      "Both password need to be the same"
                  )
              }),
            //   firstName: yup
            //   .string()
            //   .matches(/[a-zA-Z]/, 'Name cannot contain Special Characters or Numbers')
            //   .required('First Name is Required'),
            //  lastName: yup
            //   .string()
            //   .strict(true)
            //   .matches(/[a-zA-Z]/, 'Name cannot contain Special Characters or Numbers')
            //   .trim("Name cannot contain Special Characters or Numbers")
            //   .required('Last Name is Required'),

          })
        
        }>
        {({ values, handleChange, errors, setFieldTouched,isValid,touched, handleSubmit }) => (
            <View>
            <TextInput style={styles.inputBox}
              underlineColorAndroid='rgba(0,0,0,0)'
              placeholder="Current Password"
              secureTextEntry={true}
              placeholderTextColor="#ffffff"
              value={values.currentPassword}
              onChangeText={handleChange('currentPassword')}
              onBlur={() => setFieldTouched('currentPassword')}  
             /> 
              {touched.currentPassword && errors.currentPassword &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.currentPassword}</Text>
                    }
            
         
            <TextInput style={styles.inputBox}
                 underlineColorAndroid='rgba(0,0,0,0)'
                 placeholder="New Password"
                 secureTextEntry={true}
                 placeholderTextColor="#ffffff"
                 value={values.newPassword}
                 onChangeText={handleChange('newPassword')}
                 onBlur={() => setFieldTouched('newPassword')}/>
                 {touched.newPassword && errors.newPassword &&
                    <Text style={{ fontSize: 15, color: 'red' }}>{errors.newPassword}</Text>
                }
            <TextInput style={styles.inputBox}
                  underlineColorAndroid='rgba(0,0,0,0)'
                  placeholder="Confirm New Password"
                  secureTextEntry={true}
                  placeholderTextColor="#ffffff"
                  value={values.confirmNewPassword}
                  onChangeText={handleChange('confirmNewPassword')}
                  onBlur={() => setFieldTouched('confirmNewPassword')}/> 
                  {touched.confirmNewPassword && errors.confirmNewPassword &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.confirmNewPassword}</Text>
                        }
        <Button  
        style={styles.button}
              disabled={(!isValid)}
              onPress={handleSubmit}>Change Password</Button>

    
 </View>
        ) }
      </Formik>
      <Formik 
      enableReinitialize
      initialValues={{firstName:this.state.firstName, lastName:this.state.lastName}}
        onSubmit={values => {
          this.onChangeDetails(values);
        
        }}
        validationSchema={
          yup.object().shape({
              firstName: yup
              .string()
              .matches(/[a-zA-Z]+$/, 'Name cannot contain Special Characters or Numbers')
              .required('First Name is Required'),
             lastName: yup
              .string()
              .strict(true)
              .matches(/^[a-zA-Z]+$/, 'Name cannot contain Special Characters or Numbers')
              .trim("Name cannot contain Special Characters or Numbers")
              .required('Last Name is Required'),

          })
        
        }
        >
        {({ values, handleChange, errors, setFieldTouched, touched, isValid,handleSubmit }) => (
            <View>
            
       <TextInput style={styles.inputBox}
                      underlineColorAndroid='rgba(0,0,0,0)'
                      placeholder={this.state.firstName}
                      placeholderTextColor="#ffffff"
                      selectionColor="#fff"
                      keyboardType="email-address"
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={() => setFieldTouched('firstName')}    /> 
             {touched.firstName && errors.firstName &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.firstName}</Text>
                        }
        <TextInput style={styles.inputBox}
              underlineColorAndroid='rgba(0,0,0,0)'
              placeholder={this.state.lastName}
              placeholderTextColor="#ffffff"
              selectionColor="#fff"
              keyboardType="email-address"
              value={values.lastName}
              onChangeText={handleChange('lastName')}
              onBlur={() => setFieldTouched('lastName')}     /> 
                 {touched.lastName && errors.lastName &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.lastName}</Text>
                        }
              <Button  
              style={styles.button}
              disabled={(!isValid)}
              onPress={handleSubmit}>Change Details</Button>
 </View>
        ) }
      </Formik>
      <Formik
      enableReinitialize 
      initialValues={{ email:this.state.email,currentPasswordEmail:'' }}
        onSubmit={values => {
          this.onChangeEmail(values)
        
        }}
        validationSchema={
          yup.object().shape({
            email: yup
              .string()
              .matches(/[a-zA-Z0-9]+$/, 'Email contains Special Characters')
              .email('Invalid Email Format')
              .required('Email Address is Required'),
            currentPasswordEmail: yup
              .string()
              .strict(true)
              // .matches( /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/, 'Password must be 8 characters long and contain One(1) Lower Case Letter, Upper Case Letter, Number, and Special Character.')              .trim('Password contains Special Characters')
              .required('Enter Current Password'),
          })
        
        }>
        {({ values, handleChange, errors, setFieldTouched, touched, handleSubmit,isValid }) => (
            <View>
              <TextInput style={styles.inputBox}
                underlineColorAndroid='rgba(0,0,0,0)'
                underlineColorAndroid='rgba(0,0,0,0)'
                placeholder="Email Address"
                placeholderTextColor="#ffffff"
                selectionColor="#fff"
                keyboardType="email-address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={() => setFieldTouched('email')}  /> 
                {touched.email && errors.email &&
                <Text style={{ fontSize: 15, color: 'red' }}>{errors.email}</Text>
                        }
              <TextInput style={styles.inputBox}
                underlineColorAndroid='rgba(0,0,0,0)'
                underlineColorAndroid='rgba(0,0,0,0)'
                placeholder="Current Password"
                secureTextEntry={true}
                placeholderTextColor="#ffffff"
                selectionColor="#fff"
                keyboardType="email-address"
                value={values.currentPasswordEmail}
                onChangeText={handleChange('currentPasswordEmail')}
                onBlur={() => setFieldTouched('currentPasswordEmail')}      
            /> 
            {touched.currentPasswordEmail && errors.currentPasswordEmail &&
            <Text style={{ fontSize: 15, color: 'red' }}>{errors.currentPasswordEmail}</Text>
                        }
           <Button 
           style={styles.button}
           disabled={(!isValid)}
            onPress={handleSubmit}>Change Email</Button>
 </View>
        ) }
      </Formik>
      </View>
      
    )
}
}

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#833030',
    },
    signupTextCont: {
      flexGrow: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingVertical: 16,
      flexDirection: 'row'
    },
    signupText: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 16
    },
    signupButton: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '500'
    },
    inputBox: {
      width: 300,
      borderColor: 'rgba(255, 255,255,0.3)',
      backgroundColor: 'rgba(255, 255,255,0.3)',
      borderRadius: 10,
      paddingHorizontal: 16,
      marginVertical: 10,
      marginHorizontal: 45,
      position: 'relative'
    },
    button: {
      width: 300,
      backgroundColor: '#1c313a',
      borderRadius: 25,
      left:45,
      marginVertical: 10,
      paddingVertical: 13
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#ffffff',
      textAlign: 'center'
    }
  });
