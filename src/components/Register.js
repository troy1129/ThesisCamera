
import Modal from 'react-native-modal';

import React, { Component } from 'react';
import {
    StyleSheet, Text, View, TextInput,ScrollView,
    TouchableOpacity, Button, Alert, Keyboard,Dimensions,Image
} from 'react-native';
import RadioGroup from "react-native-radio-buttons-group";
import { fire2 } from '../config/fire';
import { Formik } from 'formik'
import * as yup from 'yup'
import RNPickerSelect from 'react-native-picker-select';
import Logo from './Logo';
import { Actions } from 'react-native-router-flux';
import { jsonEval, isEmpty } from '@firebase/util';
import {Picker} from 'native-base';
var screen = Dimensions.get('window');

const activeVolunteerOptions = [
    { label: 'Yes', value: 'Yes'},
    { label: 'No', value: 'No'},
]

const surgeon_medicalDegreeOptions = [
    { label: 'Bachelor of Medicine and Bachelor of Surgery (MBBS)', value: 'Bachelor of Medicine and Bachelor of Surgery'},
    { label: 'Master of Medicine (MM, MMed)', value: 'Master of Medicine'},
    { label: 'Master of Surgery (MS, MSurg, ChM)', value: 'Master of Surgery'},
    { label: 'Master of Medical Science (MMSc, MMedSc)', value: 'Master of Medical Science'},
    { label: 'Doctor of Medical Science (DMSc, DMedSc)', value: 'Doctor of Medical Science'},
    { label: 'Doctor of Surgery (DS, DSurg)', value: 'Doctor of Surgery'},
    { label: 'Doctor of Medicine (MD)', value: 'Doctor of Medicine'},
]

const surgeon_certificationOptions = [
    { label: 'General Surgeon Board Certification', value: 'General Surgeon Board Certification'},
]

const nurse_medicalDegreeOptions = [
    { label: 'Bachelor of Science in Nursing (BSN)', value: 'Bachelor of Science in Nursing'},
    { label: 'Associate Degree in Nursing (ADN)', value: 'Associate Degree in Nursing'},
]

const nurse_certificationOptions = [
    { label: 'Maternal and Child Health Nursing', value: 'Maternal and Child Health Nursing'},
    { label: 'Emergency and Trauma Nursing', value: 'Emergency and Trauma Nursing'},
    { label: 'Cardiovascular Nursing', value: 'Cardiovascular Nursing'},
]

const ems_medicalDegreeOptions = [
    {label: 'Emergency Medical Services NC II', value: 'Emergency Medical Services NC II'},
]

const ems_certificationOptions = [
    {label: 'Medical First Responder', value: 'Medical First Responder'},
    {label: 'Ambulance Care Assistants', value: 'Ambulance Care Assistants'},
    {label: 'Emergency Medical Technicians', value:'Emergency Medical Technicians'},
    {label: 'Paramedics', value: 'Paramedics'},
]
const medicalProfessionOptions = [
    { label: 'Nurse', value: 'Nurse'},
    { label: 'Surgeon', value: 'Surgeon'},
    { label: 'Emergency Medical Service Personnel', value: 'Emergency Medical Service Personnel'},
]

const durationServiceOptions = [
    {label: '1 year', value: 1},
    {label: '2 years', value: 2},
    {label: '3 years', value: 3},
    {label: '4 years', value: 4},
    {label: '5 years', value: 5},
    {label: '6 years', value: 6},
    {label: '7 years', value: 7},
    {label: '8 years', value: 8},
    {label: '9 years', value: 9},
    {label: '10 years', value: 10},
]


class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            points:0,
            firstName: '',
            durationService:'',
            certification:'',
            isActiveVolunteer:'',
            medicalDegree:'',
            medicalProfession:'',
            lastName: '',
            contactNumber: '',
            isModalVisible:false,
            isMobile: true,
            user_type: 'Responder',
            user: {},
            gender: '',
            userId: '',
            data: [
                {
                    label: "Responder",
                    value: "Responder",
                    color: "white",
                },
                {
                    label: "Regular User",
                    value: "Regular User",
                    color: "white",
                },
                {
                    label: "Volunteer",
                    value: "Volunteer",
                    color: "white",
                },
            ]
        };
    }

    userType = data => {
        this.setState({ data });

        let selectedButton = this.state.data.find(e => e.selected == true);
        selectedButton = selectedButton
            ? selectedButton.value
            : this.state.data[0].label;
        this.setState({ user_type: selectedButton });

    };

    doSendEmailVerification = () =>{
    fire2.auth().currentUser.sendEmailVerification()
    }
    
    _toggleModal = () => {
        this.setState({ isModalVisible: !this.state.isModalVisible });
    }

    checkState=()=>
    {
         alert(JSON.stringify(this.state.medicalProfession)) 
    }
    handleChangeOption(val) {
        if (val !== 0) {
          this.setState({selectedValue: val});
        }
      }
    
    computePoints=()=>
    {
        let points=0;

        if((this.state.medicalProfession!==""))
        {
            points=points+5
        }
        if((this.state.medicalDegree!=="")){
            points = points + 10;
          }
          if((this.state.certification!=="")){
            points = points + 15;
          }
          if(this.state.isActiveVolunteer==='Yes'){
            points = points + 15;
          }
          if(this.state.durationService !== 0){
            points = points + (this.state.durationService * 2);
          }
       

        return points;
    }

   
    


    createUserAccount(
        values
    ) {
        var email = values.email;
        var password = values.password;
        const auth = fire2.auth();
        const promise = auth.createUserWithEmailAndPassword(email.trim(), password.trim());
        promise.then(user => {
            //this.doSendEmailVerification()
            let points=this.computePoints()
            Alert.alert(JSON.stringify(`Account ${values.email} has been created`))
            Keyboard.dismiss();
            let app = fire2.database().ref('users/' + user.user.uid);
            let unverified = fire2.database().ref('unverifiedMobileUsers/' + user.user.uid);
            let regularUser = fire2.database().ref('mobileUsers/' + this.state.user_type + '/' + user.user.uid);
            let volunteer = fire2.database().ref('mobileUsers/' + this.state.user_type + '/' + user.user.uid);
            let responder = fire2.database().ref('mobileUsers/' + this.state.user_type + '/' + user.user.uid);
            if (this.state.user_type === 'Responder') {
                responder.update({
                    coordinates: {
                        lat: 0,
                        lng: 0,
                    },
                    incidentID: "",
                    isAccepted: false,
                })
            }
            else if (this.state.user_type === 'Regular User') {
                regularUser.update({
                    coordinates: {
                        lat: 0,
                        lng: 0,
                    },
                    incidentID: "",
                    isAccepted: false,
                })

            } else {
                volunteer.update({
                    coordinates: {
                        lat: 0,
                        lng: 0,
                    },
                    incidentID: "",
                    isAccepted: false,
                })
                fire2.database().ref(`/credentials/${user.user.uid}`).update
                ({
                    medicalProfession:this.state.medicalProfession,
                    certification:this.state.certification,
                    durationService:this.state.durationService,
                    isActiveVolunteer:this.state.isActiveVolunteer,
                    medicalDegree:this.state.medicalDegree,
                    points:points
                })
            }
            if(fire2.auth().currentUser.emailVerified===true)
            {
            unverified.update({
                user_type: this.state.user_type,
            })
            }

            app.update({
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                sex: values.gender,
                contactNumber: values.contactNumber,
                isMobile: true,
                isVerified: false,
                user_type: this.state.user_type,
            });

            console.log("Successfully Registered");
        }).catch(e => {
            var err = e.message;
            Alert.alert(JSON.stringify(`${err}`))
        })

    };


    render() {
        const placeholderMedicalProfession = {
            label: 'Select a Medical Profession',
            value: null,
            color: '#9EA0A4',
          };

          const placeholderMedicalDegree = {
            label: 'Select a Medical Degree',
            value: null,
            color: '#9EA0A4',
          };

          const placeholderCertification = {
            label: 'Select a Medical Certification',
            value: null,
            color: '#9EA0A4',
          };

          const placeholderActiveVolunteer = {
            label: 'Are you an Active Volunteer?',
            value: null,
            color: '#9EA0A4',
          };
        
          const placeholderDurationService = {
            label: 'How many years in Service?',
            value: null,
            color: '#9EA0A4',
          };
          
      
        return (
            <Formik initialValues={{ firstName: '', lastName: '', email: '', gender: '', contactNumber: '', password: '', confirmPassword: '' ,medicalProfession:''}}
                onSubmit={values => {
                    this.createUserAccount(values);


                }}
                validationSchema={
                    yup.object().shape({
                        firstName: yup
                            .string()
                            .matches(/[a-zA-Z]/, 'Name cannot contain Special Characters or Numbers')
                            .required('First Name is Required'),
                        lastName: yup
                            .string()
                            .strict(true)
                            .matches(/[a-zA-Z]/, 'Name cannot contain Special Characters or Numbers')
                            .trim("Name cannot contain Special Characters or Numbers")
                            .required('Last Name is Required'),
                        gender: yup
                            .string()
                            .strict(true)
                            .matches(/[a-zA-Z]/, 'Name cannot contain Special Characters or Numbers')
                            .trim("Name cannot contain Special Characters or Numbers")
                            .required('Sex is Required'),
                        email: yup
                            .string()
                            .email('Invalid Email Format')
                            .required('Email Address is Required'),
                        contactNumber: yup
                            .number()
                            .typeError('Only Number Inputs Allowed')
                            .required('Contact Number is Required'),
                        password: yup
                            .string()
                            .strict(true)
                            .matches(/[a-zA-Z0-9]/, 'Password cannot contain Special Characters')
                            .trim('Name cannot contain Special Characters or Numbers')
                            .required('Password is Required'),
                        confirmPassword: yup
                            .string()
                            .strict(true)
                            .matches(/[a-zA-Z0-9]/, 'Password cannot contain Special Characters')
                            .trim('Name cannot contain Special Characters or Numbers')
                            .required('You Must Confirm Password')
                            .when("password", {
                                is: val => (val && val.length > 0 ? true : false),
                                then: yup.string().oneOf(
                                    [yup.ref("password")],
                                    "Both password need to be the same"
                                )
                            })
        
                    })
                }>
                {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (
                    <ScrollView showsVerticalScrollIndicator={true}>
                    <View style={styles.container}>
                        <TextInput style={styles.inputBox}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="First Name"
                            placeholderTextColor="#ffffff"
                            selectionColor="#fff"
                            keyboardType="email-address"
                            value={values.firstName}
                            onChangeText={handleChange('firstName')}
                            onBlur={() => setFieldTouched('firstName')}
                        />
                        {touched.firstName && errors.firstName &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.firstName}</Text>
                        }
                        <TextInput style={styles.inputBox}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Last Name"
                            placeholderTextColor="#ffffff"
                            selectionColor="#fff"
                            keyboardType="email-address"
                            value={values.lastName}
                            onChangeText={handleChange('lastName')}
                            onBlur={() => setFieldTouched('lastName')}
                        />
                        {touched.lastName && errors.lastName &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.lastName}</Text>
                        }
                        <TextInput style={styles.inputBox}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Email Address"
                            placeholderTextColor="#ffffff"
                            selectionColor="#fff"
                            keyboardType="email-address"
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={() => setFieldTouched('email')}
                        />
                        {touched.email && errors.email &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.email}</Text>
                        }
                        <TextInput style={styles.inputBox}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Contact Number"
                            placeholderTextColor="#ffffff"
                            selectionColor="#fff"
                            keyboardType="email-address"
                            value={values.contactNumber}
                            onChangeText={handleChange('contactNumber')}
                            onBlur={() => setFieldTouched('contactNumber')}
                        />
                        {touched.contactNumber && errors.contactNumber &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.contactNumber}</Text>
                        }
                        <TextInput style={styles.inputBox}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Sex"
                            placeholderTextColor="#ffffff"
                            selectionColor="#fff"
                            keyboardType="email-address"
                            value={values.gender}
                            onChangeText={handleChange('gender')}
                            onBlur={() => setFieldTouched('gender')}
                        />
                        {touched.gender && errors.gender &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.gender}</Text>
                        }
                        <TextInput style={styles.inputBox}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Password"
                            secureTextEntry={true}
                            placeholderTextColor="#ffffff"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onBlur={() => setFieldTouched('password')}

                        />
                        {touched.password && errors.password &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.password}</Text>
                        }
                        <TextInput style={styles.inputBox}
                            underlineColorAndroid='rgba(0,0,0,0)'
                            placeholder="Confirm Password"
                            secureTextEntry={true}
                            placeholderTextColor="#ffffff"
                            value={values.confirmPassword}
                            onChangeText={handleChange('confirmPassword')}
                            onBlur={() => setFieldTouched('confirmPassword')}

                        />
                            {touched.confirmPassword && errors.confirmPassword &&
                            <Text style={{ fontSize: 15, color: 'red' }}>{errors.confirmPassword}</Text>
                        }

                        {this.state.user_type === 'Volunteer' ? 
                         <RNPickerSelect
                         placeholder={placeholderMedicalProfession}
                       items={medicalProfessionOptions}
                       onValueChange={value => {
                         this.setState({
                             medicalProfession: value           
                          });
                       }}
                       style={pickerSelectStyles}
                       value={this.state.medicalProfession}
                     />: null}  
                    {this.state.user_type === 'Volunteer' && this.state.medicalProfession === 'Nurse' ?
                       <RNPickerSelect
                       placeholder={placeholderMedicalDegree}
                     items={nurse_medicalDegreeOptions}
                     onValueChange={value => {
                       this.setState({
                           medicalDegree: value           
                        });
                     }}
                     style={pickerSelectStyles}
                     value={this.state.medicalDegree}
                   />: null } 

                    {this.state.user_type === 'Volunteer' && this.state.medicalProfession === 'Surgeon' ?
                            <RNPickerSelect
                            placeholder={placeholderMedicalDegree}
                          items={surgeon_medicalDegreeOptions}
                          onValueChange={value => {
                            this.setState({
                                medicalDegree: value           
                             });
                          }}
                          style={pickerSelectStyles}
                          value={this.state.medicalDegree}
                        />: null } 

                        {this.state.user_type === 'Volunteer' && this.state.medicalProfession === 'Emergency Medical Service Personnel' ?
                         <RNPickerSelect
                         placeholder={placeholderMedicalDegree}
                       items={ems_medicalDegreeOptions}
                       onValueChange={value => {
                         this.setState({
                             medicalDegree: value           
                          });
                       }}
                       style={pickerSelectStyles}
                       value={this.state.medicalDegree}
                     />
                        
                    : null } 
                    {this.state.user_type === 'Volunteer' && this.state.medicalProfession === 'Nurse' ?
                       <RNPickerSelect
                       placeholder={placeholderCertification}
                     items={nurse_certificationOptions}
                     onValueChange={value => {
                       this.setState({
                           certification: value           
                        });
                     }}
                     style={pickerSelectStyles}
                     value={this.state.certification}
                   />: null } 

                    {this.state.user_type === 'Volunteer' && this.state.medicalProfession === 'Surgeon' ?
                            <RNPickerSelect
                            placeholder={placeholderCertification}
                          items={surgeon_certificationOptions}
                          onValueChange={value => {
                            this.setState({
                                certification: value           
                             });
                          }}
                          style={pickerSelectStyles}
                          value={this.state.certification}
                        />: null } 

                        {this.state.user_type === 'Volunteer' && this.state.medicalProfession === 'Emergency Medical Service Personnel' ?
                         <RNPickerSelect
                         placeholder={placeholderCertification}
                       items={ems_certificationOptions}
                       onValueChange={value => {
                         this.setState({
                             certification: value           
                          });
                       }}
                       style={pickerSelectStyles}
                       value={this.state.certification}
                     />
                        
                    : null } 

                    {this.state.user_type === 'Volunteer' ?
                         <RNPickerSelect
                         placeholder={placeholderActiveVolunteer}
                       items={activeVolunteerOptions}
                       onValueChange={value => {
                         this.setState({
                            isActiveVolunteer: value           
                          });
                       }}
                       style={pickerSelectStyles}
                       value={this.state.isActiveVolunteer}
                     />
                        
                    : null } 

                    {this.state.user_type === 'Volunteer' ?
                         <RNPickerSelect
                         placeholder={placeholderDurationService}
                       items={durationServiceOptions}
                       onValueChange={value => {
                         this.setState({
                            durationService: value           
                          });
                       }}
                       style={pickerSelectStyles}
                       value={this.state.durationService}
                     />
                        
                    : null } 

  {/* <RNPickerSelect
            placeholder={placeholder}
          items={medicalProfession}
          onValueChange={value => {
            this.setState({
                medicalProfession: value           
             });
          }}
          style={pickerSelectStyles}
          value={this.state.medicalProfession}
        /> */}

                    
                        <RadioGroup radioButtons={this.state.data} onPress={this.userType} />
                        <TouchableOpacity style={styles.button}
                            disabled={(!this.state.medicalProfession)||(!isValid)}
                            onPress={handleSubmit}>

                            <Text style={styles.buttonText}>
                                Register
                    </Text>

                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}
                            onPress={this.checkState}>

                            <Text style={styles.buttonText}>
                                check
                    </Text>

                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}

                            onPress={() => { Actions.login() }}>

                            <Text style={styles.buttonText}>
                                Back
                    </Text>

                        </TouchableOpacity>
                        {/* <Modal isVisible={this.state.isModalVisible}
                         style={{
                         justifyContent: 'center',
                         borderRadius: 20,
                         shadowRadius: 10,
                         width: screen.width - 50,
                         backgroundColor: 'white',
                        }}
                        >

                            <TouchableOpacity onPress={this._toggleModal}>
                            <Image
                                style={{ width: 45, height: 45, marginLeft: 240 }}
                                source={require('../images/cancel.png')}
                            />
                            </TouchableOpacity>
                            <Picker
  selectedValue={this.state.language}
  style={{height: 50, width: 100}}
  onValueChange={(itemValue, itemIndex) =>
    this.setState({language: itemValue})
  }>
  <Picker.Item label="Java" value="java" />
  <Picker.Item label="JavaScript" value="js" />
</Picker>
<Picker
  selectedValue={this.state.medicalProfession}
  style={{height: 50, width: 100}}
  onValueChange={(itemValue, itemIndex) =>
    this.setState({medicalProfession: itemValue})
  }>
  <Picker.Item label="Doctor" value="Doctor" />
  <Picker.Item label="Doctor2" value="Doctor2" />
</Picker>




                         </Modal> */}
                    </View>
                    </ScrollView>
                )}
            </Formik>
        );
    }

}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      width:300,
      fontSize: 16,
      paddingHorizontal: 16,
      borderColor: 'rgba(255, 255,255,0.2)',
      borderRadius: 25,
      color: '#ffffff',
      marginVertical:10,
      paddingRight: 30, // to ensure the text is never behind the icon
      left:50,
    },
  });
  

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
        backgroundColor: 'rgba(255, 255,255,0.2)',
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#ffffff',
        marginVertical: 10
    },
    button: {
        width: 300,
        backgroundColor: '#1c313a',
        borderRadius: 25,
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

export default Register;