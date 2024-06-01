import { StyleSheet, Text, View, Button, Image, Pressable, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { AutoFocus, Camera, CameraType } from 'expo-camera/legacy';
import React, { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
// import SweetSFSymbol from "sweet-sfsymbols";

import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lifebuoy, GalleryAdd, ArrowRotateRight, Back } from 'iconsax-react-native';


const windowHeight = Dimensions.get('window').height;

export default function CameraPage({ navigation }) {

    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const cameraRef = useRef(null);
    const [cameraOpen, setOpen] = useState(true);
    const [bounceValue, setBounceValue] = useState(true);

    

    async function clearAsyncStorageIfFull() {
        try {
            let data = await AsyncStorage.getItem('@todayMacros')
            let parsedData = JSON.parse(data)
            

            // REPLACE WITH ACTUAL THING
            if (parsedData.numMeals >= 3) {
                await AsyncStorage.removeItem('@todayMacros')
            }
        } catch (e) {
            // console.log(e)
        }
    }

    function trimForJson(input) {
        const match = input.match(/\{.*\}/s);
        return match ? match[0] : null; // Return the matched group or null if not found
    }


    useFocusEffect(
        React.useCallback(() => {
            // Set cameraOpen to true whenever this screen is focused
            setOpen(true);
            clearAsyncStorageIfFull()

        }, [])
    );

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                setBounceValue(!bounceValue)

                const options = { quality: 0.5, base64: true };
                const data = await cameraRef.current.takePictureAsync(options);
                navigation.navigate("ShowPhoto", { data: data })
                setOpen(false)

            } catch (error) {
                console.log(error);
            }
        }
    };

    const changeCameraType = () => {
        if (type === CameraType.front) 
            setType(CameraType.back)
        else
            setType(CameraType.front)
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.5,
          base64: true,
        });
    
        if (!result.canceled) {
          navigation.navigate("ShowPhoto", { data: {"base64": result.assets[0].base64, "uri": result.assets[0].uri} })

        }

      };


    if (!permission) {
        // Camera permissions are still loading
        return (
            <View style={styles.container}>
                <Text>Requesting permissions...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    if (cameraOpen)
        return (
            <View style={styles.container}>
                <Camera style={styles.camera} type={type} ref={cameraRef} autoFocus={AutoFocus.off}>
                    <Pressable onPress={() => {
                        navigation.goBack()
                        setOpen(false)
                        }} style={{...styles.actionBtn, marginTop: windowHeight * 0.05 }}>
                        {/* <SweetSFSymbol name="arrow.uturn.backward" size={24} colors={["white"]} /> */}
                        <Back size="24" color="#FFF" style={{ alignSelf: "center" }} />
                    </Pressable>
                    <View style={styles.buttonContainer}>
                        <Pressable onPress={changeCameraType} style={styles.actionBtn}>
                            {/* <SweetSFSymbol name="arrow.triangle.2.circlepath" size={24} colors={["white"]} /> */}
                            <ArrowRotateRight size="24" color="#FFF" style={{ alignSelf: "center" }} />
                        </Pressable>
                        <Pressable onPress={takePicture} style={styles.pictureBtn}>
                            {/* <SweetSFSymbol name="camera.aperture" size={48} colors={["white"]} symbolEffect={{
                                type: "bounce",
                                value: bounceValue,
                                direction: "down",
                            }}/> */}
                            <Lifebuoy size="48" color="#000" style={{ alignSelf: "center" }} />
                        </Pressable>
                        <Pressable onPress={pickImage} style={styles.actionBtn}>
                            {/* <SweetSFSymbol name="photo.on.rectangle.angled" size={24} colors={["white"]} /> */}
                            <GalleryAdd size="24" color="#FFF" style={{ alignSelf: "center", }} />
                        </Pressable>
                    </View>
                </Camera>
            </View >
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
        padding: 30
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: "center",

        paddingTop: windowHeight * 0.7
    },
    button: {
        padding: 10,
        backgroundColor: '#000000a0', 
        borderRadius: 5,
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
    pictureBtn: {
        backgroundColor: "#FFCC26",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FFDE70",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 2,
        padding: 10,
        width: 140
    },
    actionBtn: {
        backgroundColor: "rgba(255, 252, 242, 0.4)",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
        width: 50,
        height: 50,
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1
    }
});
