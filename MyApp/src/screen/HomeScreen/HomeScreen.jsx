import { View, Text, FlatList, StyleSheet} from 'react-native'
import React from 'react'
import ProductItem from '../../components/ProductItem'
import {Icon} from '@rneui/themed'
import HomeHeader from '../../components/Header/HomeHeader'

const HomeScreen = () => {
    const customData = require('../../../demo-data/laptop.json');
    
  return (
    <View style={styles.container}>
      {/* <HomeHeader/> */}
        <Icon
                name='menu'
                type='material'
                color='#000'
                size={30}
                style={{padding:10}}
            />
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
});

export default HomeScreen