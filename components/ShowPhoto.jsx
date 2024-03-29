import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, SafeAreaView, ActivityIndicator, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Camera, CameraType } from 'expo-camera';
import React, { useState, useEffect, useRef } from 'react';
import { useFonts } from 'expo-font'


import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddCircle } from 'iconsax-react-native';
import Feedback from './Feedback';

export default function ShowPhoto({ route, navigation }) {
    const { data } = route.params;

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    const [nutritionData, setData] = useState(null);
    const [awaitingResponse, setAwaitingResponse] = useState(false)

    function trimForJson(input) {
        const match = input.match(/\{.*\}/s);
        return match ? match[0] : null; // Return the matched group or null if not found
    }

    async function storeData(value, imageLink) {
        return new Promise(async (resolve) => {
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
            resolve(0)
        })

    }

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
                                "emoji": one single food emoji that best represents the food,
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
                "Authorization": `Bearer ya29.a0Ad52N39TfSunXoT68jICMkFF8aOUW_DEclx56S2IpcMcO-UBqOlrpjVHFl87FX0hadRF53x9xGbDzKeeqdf4CYCCb57R2SaYpwgTOqTaQWHzz2N7egpuqsRcPqFt4ZK9ekU5cMKNS91qlBvF4SUyNGPmLaIz3lf6JmsKeOlXtwaCgYKAYASARMSFQHGX2Mi-m-u5cKZ7sTy5Q2Zeqp5DQ0177`,
                "Content-Type": "application/json"
            }
        };

        const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:streamGenerateContent`;

        setAwaitingResponse(true);
        axios.post(url, requestBody, config)
            .then(response => {
                // setAwaitingResponse(false);
                // console.log(response.data);
                // console.log(response.data[0].candidates[0].content.parts)
                var result = ""
                for (let i = 0; i < response.data.length; i++) {
                    result += response.data[i].candidates[0].content.parts[0].text;
                }

                result = trimForJson(result)
                console.log(result)
                storeData(result, imageLink).then(response => {
                    navigation.navigate("Feedback");
                })



                const foodData = JSON.parse(result)
                console.log(foodData["GIindex"])
                // if (foodData["GIindex"] <= 55) {
                //     setData("Good for diabetics")
                // } else {
                //     setData("Not recommended for diabetics")
                // }
            })
            .catch(error => {
                console.error(error.message);
            });
    }


    return (

        <SafeAreaView style={styles.container}>
            <Button title="Take another picture" onPress={() => navigation.goBack()} />
            <Image source={{ uri: data.uri }} style={styles.previewImage} />
            <Text>{nutritionData}</Text>

            <Pressable style={styles.submitButton} onPress={() => sendRequest(data.base64, data.uri)}>
                {!awaitingResponse
                    ?  <Text style={styles.submitButtonText}>Looks Good!</Text>
                    :  <ActivityIndicator />
                }

            </Pressable>


            <Button title="print data" onPress={async () => {
                let savedData = await AsyncStorage.getItem('@totalMacros');
                console.log(savedData)
            }}></Button>

        </SafeAreaView >
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',

    },
    camera: {
        flex: 1,
        width: '100%',
    },
    previewImage: {
        width: 300,
        height: 300,
        marginTop: 20,
        borderRadius: 15,
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
    submitButton: {
        backgroundColor: "#2B2F56",
        width: 150,
        height: 50,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    submitButtonText: {
        color: "white",
        fontSize: 20,
        fontFamily: "SF-Rounded",
    }
});