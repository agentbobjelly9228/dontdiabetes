import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { Link } from 'expo-router';
import { Camera, CameraType } from 'expo-camera';
import React, { useState, useEffect, useRef } from 'react';

import { TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddCircle } from 'iconsax-react-native';

export default function CameraPage({ navigation }) {

    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const cameraRef = useRef(null);
    const [image, setImage] = useState(null);
    const [cameraOpen, setOpen] = useState(true);
    const [nutritionData, setData] = useState(null);
    const [awaitingResponse, setAwaitingResponse] = useState(true)

    async function clearAsyncStorageIfFull() {
        try {
            let data = await AsyncStorage.getItem('@totalMacros')
            let parsedData = JSON.parse(data)
            if (parsedData.numMeals >= 3)
                return await AsyncStorage.clear();
        } catch (e) {

        }
    }

    function trimForJson(input) {
        const match = input.match(/\{.*\}/s);
        return match ? match[0] : null; // Return the matched group or null if not found
    }

    async function storeData(value, imageLink) {
        try {
            value = JSON.parse(value)
            let savedData = await AsyncStorage.getItem('@totalMacros');
            var macros = savedData ? JSON.parse(savedData) : {}; // Parse the saved data, if it exists

            // Initialize macros properties if they don't exist
            if (!macros.GIs) {
                console.log("null")
                macros.fruit = 0;
                macros.vegetables = 0;
                macros.grains = 0;
                macros.protein = 0;
                macros.dairy = 0;
                macros.kcal = 0;
                macros.numMeals = 0;
                macros.images = [];
                macros.GIs = [];
                macros.emojis = [];
            }

            // Assuming `value` is already an object with the correct structure
            macros.fruit += value.fruit;
            macros.vegetables += value.vegetables;
            macros.grains += value.grains;
            macros.kcal += value.kcal;
            macros.protein += value.protein;
            macros.dairy += value.dairy;
            macros.numMeals += 1;
            macros.images.push(imageLink)
            macros.GIs.push(value.GIindex)
            macros.emojis.push(value.emoji)

            // Save the updated macros back to AsyncStorage
            await AsyncStorage.setItem('@totalMacros', JSON.stringify(macros));
        } catch (e) {
            // Handle saving error
            console.log(e);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            // Set cameraOpen to true whenever this screen is focused
            setOpen(true);
            setData(null)


            clearAsyncStorageIfFull()

        }, [])
    );

    function sendRequest(imageData, imageLink) {
        const API_ENDPOINT = "us-central1-aiplatform.googleapis.com";
        const PROJECT_ID = "inferapp-8a180";
        const MODEL_ID = "gemini-1.0-pro-vision-001";
        const LOCATION_ID = "us-central1";

        const requestBody = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": `Here is an image of food. Considering the size of the meal, estimate each of the following quantities: Calories, fruits (cups), vegetables (cups), grains (ounces), protein (ounces), dairy (cups), GI index. 
                            Consult online sources and be realistic. Return your answer in only a JSON format like this: 
                            {
                                "food": food description with quantity,
                                "emoji": one emoji that best represents the food,
                                "kcal": amount of kilocalories,
                                "fruit": amount of fruit in cups,
                                "vegetables": amount of vegetables in cups,
                                "grains": amount of grains in ounces,
                                "protein": amount of protein in ounces,
                                "dairy": amount of dairy in cups,
                                "GIindex": estimated GI index of the food,
                                
                            }. `
                        },
                        {
                            "inlineData": {
                                "mimeType": "image/jpeg",
                                "data": imageData
                            }
                        }

                    ],

                }
            ],
            "generation_config": {
                "maxOutputTokens": 2048,
                "temperature": 0.4,
                "topP": 1,
                "topK": 32
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_ONLY_HIGH"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_ONLY_HIGH"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_ONLY_HIGH"
                },
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_ONLY_HIGH"
                }
            ]
        };

        const config = {
            headers: {
                //if it breaks use this command gcloud auth print-access-token
                "Authorization": `Bearer ya29.a0Ad52N3-DLY9LiZeCH3qcEL4xb34iPeNY4UoKihZghF44SBm3nf-7GJqgezUeHgfhNEMuNwYhrN85aZFlS8QiF6peSwHvE1YcdXqI9BmJ4EG9bLYw6nPuO24mgNaj3bIK45QtdnRrTeC843Afwn0wdkHy6Ekzup3OOgHsZmm-XJcaCgYKARoSARASFQHGX2MiRriJz8NKUbL2QnUDUdc1Bw0178`,
                "Content-Type": "application/json"
            }
        };

        const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:streamGenerateContent`;

        // setAwaitingResponse(true);
        axios.post(url, requestBody, config)
            .then(response => {
                setAwaitingResponse(false);
                console.log(response.data);
                console.log(response.data[0].candidates[0].content.parts)
                var result = ""
                for (let i = 0; i < response.data.length; i++) {
                    result += response.data[i].candidates[0].content.parts[0].text;
                }

                console.log(result)
                result = trimForJson(result)
                console.log(result)
                storeData(result, imageLink)
                // setData(result)
                const foodData = JSON.parse(result)
                console.log(foodData["GIindex"])
                if (foodData["GIindex"] <= 55) {
                    setData("Good for diabetics")
                } else {
                    setData("Not recommended for diabetics")
                }
            })
            .catch(error => {
                console.error(error.message);
            });
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const options = { quality: 0.5, base64: true };
                const data = await cameraRef.current.takePictureAsync(options);
                // console.log(data.uri);
                // console.log(data.base64)
                navigation.navigate("ShowPhoto", { data: data })

                // setImage(data.uri);
                // setOpen(false);
                // sendRequest(data.base64, data.uri);
                // Here you can handle the captured image, e.g., display it or upload it to a server
            } catch (error) {
                console.log(error);
                // Handle any errors here
            }
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

                {image && !cameraOpen ? <Image source={{ uri: image }} style={styles.previewImage} /> : null}
                {/* <Text>{nutritionData}</Text> */}

                {cameraOpen ? <Camera style={styles.camera} type={type} ref={cameraRef}>
                    <View style={styles.buttonContainer}>
                        {/* <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                        <Text style={styles.text}>Flip Camera</Text>
                    </TouchableOpacity> */}

                        <AddCircle onPress={takePicture} size="64" color="#FFFFFF" style={{ alignSelf: "center" }} />
                        {/* <Button title="Take picture" onPress={takePicture}></Button> */}
                        <Button title="print data" onPress={async () => {
                            let savedData = await AsyncStorage.getItem('@totalMacros');
                            console.log(savedData)
                        }}></Button>

                    </View>
                </Camera> : null}
            </View >
        );

    return (
        <View style={styles.container}>

            {image && !cameraOpen ? <Image source={{ uri: image }} style={styles.previewImage} /> : null}
            <Text>{nutritionData}</Text>

            {!nutritionData
                ? <Text>Looks Delicious! Hang tight - we're recording your food.</Text>
                : <Button title="Let's recap!" onPress={() => navigation.navigate("dailyMacros")} />
            }

        </View >
    )
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
    },
    previewImage: {
        width: 300, // Set this to your desired width
        height: 300, // Set this to your desired height
        marginTop: 20, // Adds some space above the image
    },

    buttonContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 20,
        paddingTop: 550
    },
    button: {
        padding: 10,
        backgroundColor: '#000000a0', // Semi-transparent background
        borderRadius: 5,
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
});