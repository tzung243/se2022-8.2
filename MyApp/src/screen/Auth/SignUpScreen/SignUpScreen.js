import { View, Text, Image, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import CustomInput from '../../../components/CustomInput/CustomInput';
import CustomButton from '../../../components/Button/CustomButton/CustomButton';
import SocialSignInButton from '../../../components/Button/SocialSignInButton';
import CustomDivider from '../../../components/CustomDivider';
import { SocialIcon, Icon, CheckBox, Button, Header } from '@rneui/themed';
import PhoneNumberInput from '../../../components/PhoneNumberInput';
import styles from '../../../styles/authScreen';

const SignUpScreen = ({ navigation }) => {

    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [remember, setRemember] = React.useState(false);

    const onRegisterPressed = () => {
        console.warn('Sign up pressed');
        navigation.push('SignIn');
    }


    return (
        <View style={styles.root}>


            <Image
                style={styles.logo}
                source={{ uri: 'https://i.imgur.com/TQAOVkU.jpeg' }}
            />

            <Text style={styles.title}>
                Create new account
            </Text>
            {/* <CustomInput 
                placeholder='Phone Number'
                value={phoneNumber}
                setValue={setPhoneNumber}
            />  */}
            {/* <PhoneNumberInput/> */}

            <CustomInput
                label='email'
                placeholder='Email'
                leftIcon={
                    <Icon
                        type='material-community'
                        name="mail"
                        size={20}
                    />
                }
            />
            <CustomInput
                label='username'
                placeholder='Full Name'
                leftIcon={
                    <Icon
                        type='material-community'
                        name="account-outline"
                        size={20}
                    />
                }
            />

            <CheckBox
                center
                title='Remember me'
                iconType='material-community'
                checkedIcon='checkbox-marked'
                uncheckedIcon='checkbox-blank-outline'
                checkedColor='green'
                checked={remember}
                onPress={() => setRemember(!remember)}
                wrapperStyle={{ marginVertical: 10 }}
            />

            <CustomButton
                text='Sign Up'
                onPress={onRegisterPressed}
            />
            <CustomDivider
                text="or continue with"
            />
            <View style={{ flexDirection: 'row' }}>
                <SocialIcon
                    //Social Icon using @rneui/themed
                    button
                    light
                    //To make a button type Social Icon
                    type="facebook"
                    //Type of Social Icon
                    onPress={() => {
                        //Action to perform on press of Social Icon
                        alert('facebook');
                    }}
                />
                <SocialIcon
                    //Social Icon using @rneui/themed
                    button
                    light
                    //To make a button type Social Icon
                    type="google"
                    //Type of Social Icon
                    onPress={() => {
                        //Action to perform on press of Social Icon
                        alert('google');
                    }}
                />
            </View>
            <Button
                containerStyle={{
                    width: "80%",
                    marginHorizontal: 50,
                    marginVertical: 10,
                }}
                title="Already have an account? Sign in"
                type="clear"
                titleStyle={{ color: 'grey', fontSize: 12, }}
                onPress={() => navigation.push("SignIn")}
            />
        </View>
    )
}


export default SignUpScreen