import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Button } from '@rneui/themed'
import { SIZES, COLORS, FONTS } from '../../../constants'
import { useNavigation } from '@react-navigation/native'
const PlaceOrder = ({dictOrdered}) => {
    const navigation = useNavigation()
    const [listIds, setListIds] = React.useState([])
    function handlePress() {
        let res = [];
        for (let key in dictOrdered) {
            if (dictOrdered[key] == true) {
                res.push(key);
            }
        }
        setListIds(res);
        navigation.navigate('Checkout', {listId: listIds})
    }
  return (
    <Button
        title={"Place Order"}
        buttonStyle={styles.addToCartStyle}
        titleStyle={{
            ...FONTS.h3,
        }}
        containerStyle={{
            position: 'relative',
            padding: SIZES.padding * 2,
            paddingBottom: SIZES.padding*1.5,
        }}
        onPress={handlePress()}
    />
  )
}

export default PlaceOrder
const styles = StyleSheet.create({
    addToCartStyle: {
        bottom: 20,
        padding: SIZES.padding * 2,
        width: '100%',
        height: 60,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: SIZES.radius,
    },
})