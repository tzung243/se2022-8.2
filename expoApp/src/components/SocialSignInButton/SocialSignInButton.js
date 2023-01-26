import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import CustomButton from '../CustomButton/CustomButton'

const SocialSignInButton = () => {
    
    const onSignInFacebook = () => {
        console.warn('Sign in with Facebook pressed')
    }
    const onSignInGoogle = () => {
        console.warn('Sign in with Google pressed')
    }
  return (
    <>
        <CustomButton 
            text = 'Continue with Facebook' 
            onPress={onSignInFacebook}
            bgColor="#E7EAF4"
            fgColor="#4765A9"

        />
        <CustomButton 
            text = 'Continue with Google' 
            onPress={onSignInGoogle}
            bgColor="#FAE9EA"
            fgColor="#DD4D44"
        />
    </>
  )
}
const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})
export default SocialSignInButton