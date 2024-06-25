import { StyleSheet, Text, View, Button, Image, SafeAreaView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useFonts } from 'expo-font'
import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from '@react-native-async-storage/async-storage';
import smallGuy from '../assets/mascots/smallGuy.png';
import { Like1, Back } from 'iconsax-react-native';
import { FIREBASE_STORAGE } from '../FirebaseConfig';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


// import SweetSFSymbol from "sweet-sfsymbols";

const windowHeight = Dimensions.get('window').height;

const dayjs = require('dayjs');



export default function ShowPhoto({ route, navigation }) {
    const { imageData, textData, mealKey } = route.params;
    // console.log(mealKey)
    const storage = FIREBASE_STORAGE;
    const [angle, setAngle] = useState(null);
    const [awaitingResponse, setAwaitingResponse] = useState(false);
    const [hour, setHour] = useState(null)

    // Assumes user has breakfast at 8, lunch at 12, and dinner at 18
    const [preferredMealTimes, setTimes] = useState({ "breakfast": 8, "lunch": 12, "dinner": 18 })

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
        "Caveat-Bold": require("../assets/fonts/Caveat-Bold.ttf"),
        "Caveat-Medium": require("../assets/fonts/Caveat-Medium.ttf"),
        "Caveat-Regular": require("../assets/fonts/Caveat-Regular.ttf"),
        "Caveat-SemiBold": require("../assets/fonts/Caveat-SemiBold.ttf"),
    });
    const getBlobFroUri = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        return blob;
    };
    useEffect(() => {
        // Get random angle of photo (between -5 and 5)
        let number = Math.round(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1)
        setAngle(number + "deg")

        // Get current hour
        setHour(dayjs().hour())
    }, [])


    function trimForJson(input) {
        const match = input.match(/\{.*\}/s);
        return match ? match[0] : null; // Return the matched group or null if not found
    }

    async function storeData(value, imageLink) {
        return new Promise(async (resolve) => {
            let savedData = await AsyncStorage.getItem('@todayMacros');
            var macros = savedData ? JSON.parse(savedData) : {}; // Parse the saved data, if it exists

            // Initialize macros properties if they don't exist
            if (!macros.foods) {
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
                macros.emojis = {};
                macros.foods = {};

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
            value.image = imageLink
            value.protein = value.protein;
            value.description = value.food

            // // Get meals already registered for today
            // const meals = Object.keys(macros.foods)

            // // Logic for which meal it should be
            // let currentMeal = null;
            // if (!meals.includes('breakfast') && hour <= preferredMealTimes["lunch"] - 1)
            //     currentMeal = 'breakfast'
            // else if (!meals.includes('lunch') && hour <= preferredMealTimes["dinner"] - 1)
            //     currentMeal = 'lunch'
            // else
            //     currentMeal = 'dinner'

            macros.foods[mealKey] = value
            macros.emojis[mealKey] = value.emoji

            console.log(mealKey)


            console.log(macros)
            // Save the updated macros back to AsyncStorage
            await AsyncStorage.setItem('@todayMacros', JSON.stringify(macros));

            // Save food to allFoods (for gallery view)
            let currentFoods = await AsyncStorage.getItem("@allFoods")
            let parsedFoods = currentFoods ? JSON.parse(currentFoods) : []
            parsedFoods.push(value)
            await AsyncStorage.setItem('@allFoods', JSON.stringify(parsedFoods));


            resolve(0)
        })

    }


    async function sendTextRequest(text) {
        const apiKey = "AIzaSyDNDv6k5t-YBPcrwtf8AZplMjSfkTaGCgc";
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        setAwaitingResponse(true);

        const result = await model.generateContent([`Here is a description of food: ${text}. Considering the size of the meal, estimate each of the following quantities: Calories, fruits (cups), vegetables (cups), grains (ounces), protein (ounces), dairy (cups), GI index. 
            Consult online sources and be realistic. Return your answer in only a JSON format like this: 
            {
                "food": food title in 7 words or less (capitalize each word),
                "emoji": ONE SINGLE food emoji that best represents the food,
                "kcal": amount of kilocalories,
                "fruit": amount of fruit in cups,
                "vegetables": amount of vegetables in cups,
                "grains": amount of grains in ounces,
                "protein": amount of protein in ounces,
                "dairy": amount of dairy in cups,
                "GIindex": estimated GI index of the food,
                
            }.`]);

        const response = await result.response;
        var text = response.text().toString();
        text = trimForJson(text)
        console.log(text)
        console.log("hi")
        storeData(text, null).then(response => {
            console.log("hi")
            navigation.navigate("Feedback");
        })
    }

    async function sendRequest(imageData, imageLink) {
        //store stuff in firebase
        // const imageBlob = await getBlobFroUri(imageLink)
        // const uid = await AsyncStorage.getItem("@uid");
        // const timestamp = Date.now();
        // const storageRef = ref(storage, `${uid}/${timestamp}.jpg`);

        // const uploadTask = uploadBytesResumable(storageRef, imageBlob);

        // uploadTask.on(
        //     'state_changed',
        //     (snapshot) => {
        //         // Progress function
        //         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //         console.log(`Upload is ${progress}% done`);
        //     },
        //     (error) => {
        //         // Error function
        //         console.error("Upload failed:", error);
        //     },
        //     () => {
        //         // Complete function
        //         console.log("Upload successful!");
        //     }
        // );
        //actual requesting stuff
        const apiKey = "AIzaSyDNDv6k5t-YBPcrwtf8AZplMjSfkTaGCgc";
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        setAwaitingResponse(true);

        const result = await model.generateContent([`Here is an image. If it does not contain food, return only the string "error"
            However, if the image does contain food, considering the size of the meal, estimate each of the following quantities: Calories, fruits (cups), vegetables (cups), grains (ounces), protein (ounces), dairy (cups), GI index. 
                                Consult online sources and be realistic. Return your answer in only a JSON format like this: 
                                {"food": food title in 7 words or less (capitalize each word),
                                    "emoji": ONE SINGLE food emoji that best represents the food,
                                    "kcal": amount of kilocalories,
                                    "fruit": amount of fruit in cups,
                                    "vegetables": amount of vegetables in cups,
                                    "grains": amount of grains in ounces,
                                    "protein": amount of protein in ounces,
                                    "dairy": amount of dairy in cups,
                                    "GIindex": estimated GI index of the food}
                                
                                `, { inlineData: { data: imageData, mimeType: 'image/png' } }]);

        const response = await result.response;
        var text = response.text().toString();
        console.log(text)
        text = trimForJson(text);
        console.log(text)
        
        
        let parsedText = JSON.parse(text);
        
        // check if JSON is formatted correctly
        if (!isNaN(parsedText?.fruit))
            storeData(parsedText, null).then(response => {
                console.log("hi")
                navigation.navigate("Feedback");

            })
        else {
            // not food!
            console.log("Bad photo")
            navigation.navigate("Camera", { mealKey: mealKey, alertBadPhoto: true})
        }
    }

    if (fontsLoaded && angle)
        return (
            <SafeAreaView style={styles.container}>

                <View style={styles.commentContainer}>
                    <Text style={styles.comment}>
                        True home cook!
                    </Text>
                    <Image source={smallGuy} style={styles.smallGuyImg} />
                </View>

                <View style={{ ...styles.imgFrame, transform: [{ rotate: angle }] }}>

                    {imageData 
                        ? <Image source={{ uri: imageData.uri }} style={styles.previewImage} />
                        : <Text>{textData}</Text>
                    }
                    <Text style={styles.description}>
                        5/28/24
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable style={styles.backBtn} onPress={() => {if (!awaitingResponse) navigation.goBack()}}>
                        {!awaitingResponse
                            // ? <SweetSFSymbol name="arrow.uturn.backward" size={24} />
                            ? <Back size="32" color="#000" />
                            : <ActivityIndicator />
                        }
                    </Pressable>
                    <Pressable style={styles.submitBtn} 
                        onPress={() => {
                            if (imageData && !awaitingResponse)
                                sendRequest(imageData.base64, imageData.uri)
                            else
                                sendTextRequest(textData)

                            
                        }}
                    >
                        {!awaitingResponse
                            // ? <SweetSFSymbol name="checkmark" size={48} />
                            ? <Like1 size="64" color="#000" />
                            : <ActivityIndicator />
                        }
                    </Pressable>
                </View>

                {/* <Button title="print data" onPress={async () => {
                let savedData = await AsyncStorage.getItem('@allFoods');
                console.log(savedData)
            }}></Button> */}

            </SafeAreaView >
        )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFCC26',

    },
    camera: {
        flex: 1,
        width: '100%',
    },
    button: {
        padding: 10,
        backgroundColor: '#000000a0', // Semi-transparent background
        borderRadius: 5,
    },
    backBtn: {
        backgroundColor: "#FFD855",
        width: 50,
        height: 50,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    submitBtn: {
        backgroundColor: "#FFD855",
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        borderColor: "rgba(255, 255, 255, 0.10)",
        borderWidth: 1,
    },
    previewImage: {
        width: 300,
        height: 300,
        borderRadius: 3,
    },
    description: {
        fontSize: 30,
        textAlign: "center",
        fontFamily: "Caveat-Bold",
    },
    comment: {
        fontSize: 40,
        textAlign: "center",
        fontFamily: "Caveat-Bold",
        paddingLeft: 10,
        paddingRight: 10,
    },
    commentContainer: {
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: windowHeight * 0.1
    },
    imgFrame: {
        backgroundColor: "white",
        padding: 8,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        gap: 10,
        position: "absolute",
        top: windowHeight * 0.25
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: "center",
        margin: 20,
        flexDirection: "row",
        gap: 20,
        position: "absolute",
        top: windowHeight * 0.75,
    },
});
