import { StyleSheet} from 'react-native'
import React from 'react'
import { Image } from 'react-native';
import { API_URL } from '../../services';
import { Dialog } from '@rneui/themed';
import { getProductDetail } from '../../services/products';

const ImageProduct = props => {
    const [image, setImage] = React.useState("");
    const [loading , setLoading] = React.useState(false);
    React.useEffect(() => {
        setLoading(true);
        if (!props.itemImage) {
            const tmp = getProductDetail(props.itemId);
            tmp.then((res) => {
                setImage(res.attributes.image.data[0].attributes.url);
            }).catch((err) => {
                console.log(err);
            });
        }
        // console.log("IMG: ", image);
        setTimeout(() => 
            setLoading(false)
        , 1000);

    }, []);
  return (
    // console.log("IMG: ", JSON.stringify(props)),
    loading ? <Dialog.Loading loadingStyle ={{...props.style}}/> : (
        <>
            <Image 
                style={{...props.style}}
                source={{
                    uri: API_URL+ props.itemImage ? props.itemImage : image
                }}
            />
        </>
    )
  )
}

export default ImageProduct

const styles = StyleSheet.create({})