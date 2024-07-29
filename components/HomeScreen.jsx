import { useFonts } from "expo-font";
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, Pressable, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import DashedLine from 'react-native-dashed-line';
import { FIREBASE_DATABASE } from '../FirebaseConfig';
import { ref, set, get, remove } from 'firebase/database';
import greenGuy from '../assets/mascots/greenGuy.png';
import yellowGuy from '../assets/mascots/yellowGuy.png';
import redGuy from '../assets/mascots/redGuy.png';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import Tabs from "./Tabs";

import ProgressBar from "./ProgressBar";
import WeeklyGraph from "./WeeklyGraph";
import { revokeAccessToken, OAuthProvider, signInWithCredential } from "firebase/auth";
import * as AppleAuthentication from 'expo-apple-authentication';
import { Logout } from "iconsax-react-native";
import homeguy from "../assets/mascots/homeguy.png"
import { MagicStar } from "iconsax-react-native";
import SweetSFSymbol from "sweet-sfsymbols";




const dayjs = require('dayjs')

function createNoSettingsAlert() {
    Alert.alert("No settings yet", "We didn't make this page yet, sorry", [
        { text: 'OK' },
    ])
}

const screenHeight = Dimensions.get("screen").height;
const screenWidth = Dimensions.get("screen").width;

export default function HomeScreen({ route, navigation }) {
    // AsyncStorage.clear()
    // clearData();
    // console.log(route.params.updateCameraBtn)

    const auth = FIREBASE_AUTH;
    // auth.signOut()
    const database = FIREBASE_DATABASE;
    const [loading, setLoading] = useState(true);
    const [emojis, setEmojis] = useState([]);
    const [graphData, setGraphData] = useState([]);
    const [mascot, setMascot] = useState("");
    const [advice, setAdvice] = useState("");
    const [themeColor, setTheme] = useState("");
    const [images, setImages] = useState([]);
    const [foods, setFoods] = useState([])
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    // const [uid, setUID] = useState("");
    const [currentMeal, setCurrentMeal] = useState(0)
    const [name, setName] = useState(null)
    const [meals, setMeals] = useState([])

    // Assumes user has breakfast at 8, lunch at 12, and dinner at 18
    const [preferredMealTimes, setTimes] = useState({ "breakfast": 8, "lunch": 12, "dinner": 18 })
    // auth.signOut()
    // AsyncStorage.clear()

    const deleteAppleAccount = async () => {
        AsyncStorage.clear()
        auth.currentUser.delete()
        // try {
        //     const appleCredential = await AppleAuthentication.refreshAsync()

        //     // Revokes token
        //     await revokeAccessToken(auth, appleCredential.authorizationCode)


        //     // Signs user out
        //     const provider = new OAuthProvider('apple.com');
        //     const { identityToken } = appleCredential;
        //     const credential = provider.credential({
        //         idToken: identityToken,
        //         rawNonce: appleCredential.authorizationCode
        //     })
        //     const { user } = await signInWithCredential(auth, credential);
        //     user.delete()
        // } catch (e) {
        //     console.log(e)
        // }


    }
    async function newCalculationScore(data) {
        // Carbs: 45–65 % of your daily calories
        // Protein: 10–35 % of your daily calories
        // Fat: 20–35 % of your daily calories
        // BMR = 66.47 + (13.75 x weight in kg) + (5.003 x height in cm) - (6.755 x age in years)
        //calculate ideal calories

        let snapshot = await get(ref(database, auth.currentUser.uid))
        let personalMetrics;
        if (snapshot.exists()) {
            personalMetrics = snapshot.val().profile;
        } else {
            console.log("No data available");
        }
        let heightCM = parseInt(personalMetrics.height) * 2.54
        let weightKG = parseInt(personalMetrics.weight) * 0.45359237
        let BMR = 66.47 + (13.75 * weightKG) + (5.003 * heightCM) - (6.755 * parseInt(personalMetrics.age))
        let idealCalories = BMR * 1.375
        console.log(idealCalories)
        let carbCalories = 1000;
        let proteinCalories = 600;
        let fatCalories = 500;
        let carbCalorieRatio = carbCalories / idealCalories;
        let fatCalorieRatio = fatCalories / idealCalories;
        let proteinCalorieRatio = proteinCalories / idealCalories;
        console.log("Carb ratio: " + carbCalorieRatio)
        console.log("Protein ratio: " + proteinCalorieRatio)
        console.log("Fat ratio: " + fatCalorieRatio)
        let overallScore = carbCalorieRatio + fatCalorieRatio + proteinCalorieRatio;
        //score range should be 0.75 - 1.25
        console.log(overallScore)
        if (overallScore > 0.75 && overallScore < 1.25) {
            console.log("You're in the range")
        } else {
            console.log("Out of the range")
        }

    }

    async function getGraphData(uid) {
        let snapshot = await get(ref(database, uid))
        if (snapshot.exists()) {
            const allScores = snapshot.val()?.scores || [];
            setGraphData(allScores);
        } else {
            setGraphData([])
        }
    }

    const setMessages = (hour, meals) => {
        if (meals.length === 3) {
            setTitle("What a Good Day!");
            setMascot(greenGuy);
            setTheme("#A8C84C");
            setSubtitle("You've done it! Enjoy the rest of your day.");
            setCurrentMeal(2);
        } else if (meals.includes('dinner')) {
            setTitle("What a Good Day!")
            setMascot(greenGuy);
            setTheme("#A8C84C");
            setSubtitle("And that's it! But it looks like you haven't logged everything yet. What'd you eat? We're curious!")
            setCurrentMeal(2);
        } else if (hour >= preferredMealTimes["dinner"] - 1) {
            setTitle("Time for Dinner!");
            setSubtitle("Take some time to relax. Enjoy your meal and know that you are valuable just the way you are.");
            setMascot(redGuy);
            setTheme("#F3B15B");;
            setCurrentMeal(2);
        } else if (hour >= preferredMealTimes["lunch"] - 1) {
            setTitle("It's Lunch Time!");
            setSubtitle("Let's set the tone for today and make it a good one. Pay attention to your hunger cues but don't stress out.");
            setMascot(yellowGuy);
            setTheme("#F1CF48");
            setCurrentMeal(1);
        } else {
            setTitle("BREAKFAST TIME!!!!");
            setSubtitle("Kick today off with a great start by enjoying your meal.");
            setMascot(greenGuy);
            setTheme("#A8C84C");
            setCurrentMeal(0);
        }
    }

    // clearData()
    // TODO: Add reset on new day
    function clearData() {
        AsyncStorage.removeItem("@todayMacros")
    }
    function sameDay(day1, day2) {
        // console.log(day1)
        // console.log(day2)
        if (day1[0] == day2[0] && day1[1] == day2[1] && day1[2] == day2[2]) {
            return true
        }
        return false
    }
    async function checkClear() {
        const now = new Date();
        // console.log(now)
        const lastMealTime = await AsyncStorage.getItem("@lastMealTime")
        const d = new Date(lastMealTime)
        // console.log(now.getDate())
        // console.log(sameDay([now.getDate(), now.getMonth(), now.getFullYear()], [d.getDate(), d.getMonth(), d.getFullYear()]) + "sup")
        if (!sameDay([now.getDate(), now.getMonth(), now.getFullYear()], [d.getDate(), d.getMonth(), d.getFullYear()])) {
            clearData();
        }
    }
    // console.log(emojis)
    // useEffect(() => {
    //     // clearData()
    //     checkClear().then(() => {
    //         getAsyncData()
    //     })

    // }, [])

    const getAsyncData = async () => {
        let savedData = await AsyncStorage.getItem('@todayMacros');

        let uid = auth.currentUser.uid;
        // console.log(auth.currentUser.uid)
        getGraphData(uid);

        let displayName = auth.currentUser.displayName || await AsyncStorage.getItem("@name")
        setName(displayName);

        let macros = savedData ? JSON.parse(savedData) : null;

        console.log(macros)

        // Set title, subtitle, mascot, and theme
        let hour = dayjs().hour();
        let meals = []

        if (macros)
            meals = Object.keys(macros?.foods)
        setMeals(meals)
        try {
            let temp = []
            temp.push(macros?.foods["breakfast"]?.food)
            temp.push(macros?.foods["lunch"]?.food)
            temp.push(macros?.foods["dinner"]?.food)
            setFoods(temp)
            setImages(macros?.images)
            // console.log(macros?.images + "hi")
        } catch (e) {
            console.log(e)
        }


        // console.log(meals)
        setMessages(hour, meals)
        setEmojis(macros?.emojis);

        setLoading(false)
    }
    function clearHistory() {
        clearData()
        AsyncStorage.removeItem("@allFoods")
        getAsyncData()
        remove(ref(database, auth.currentUser.uid + "/scores"))
        route.params.updateCameraBtn()
    }

    useFocusEffect(
        React.useCallback(() => {

            checkClear().then(() => {
                getAsyncData()
            })
            // deleteAppleAccount();
            // getGraphData();
        }, [])


    );
    async function getFeedback() {
        const advice1 = await AsyncStorage.getItem("@tmrwAdvice1")
        const advice2 = await AsyncStorage.getItem("@tmrwAdvice2")
        const advice3 = await AsyncStorage.getItem("@tmrwAdvice3")
        const advice1Highlight = await AsyncStorage.getItem("@tmrwAdvice1Highlight")
        const advice2Highlight = await AsyncStorage.getItem("@tmrwAdvice2Highlight")
        const advice3Highlight = await AsyncStorage.getItem("@tmrwAdvice3Highlight")
        var temp = "";
        if (advice1 && advice1Highlight) {
            temp += advice1 + " " + advice1Highlight + ". "
        }
        if (advice2 && advice2Highlight) {
            temp += advice2 + " " + advice2Highlight + ". "
        }
        if (advice3 && advice3Highlight) {
            temp += advice3 + " " + advice3Highlight + ". "
        }
        // console.log(temp + " whadup there")
        setAdvice(temp);
        // console.log(advice1 + advice1Highlight)
        // console.log(advice2 + advice2Highlight)
        // console.log(advice3 + advice3Highlight)
    }
    useEffect(() => {
        getFeedback()
    })

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
        "SF-Pro-Medium": require("../assets/fonts/SF-Pro-Text-Medium.otf"),
        "SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
        "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
    });

    if (!loading && name)
        return (
            <ScrollView style={{ flex: 1, backgroundColor: "#FFFBEE" }}>
                <Image source={homeguy} style={{ alignSelf: "center", height: screenHeight * 0.8, resizeMode: "contain", position: "absolute", top: screenHeight * -0.25, }} />
                <View style={{ paddingTop: screenHeight * 0.3, justifyContent: "center", width: "100%", }}>
                    <View style={{ alignItems: "left", marginLeft: 20, marginRight: 20, paddingBottom: 30 }}>
                        {/* <Text style={styles.blurb}>Hi {name},</Text> */}
                        <Text style={styles.title}>{title}</Text>
                    </View>

                    <View style={{ alignItems: "center", backgroundColor: "#FFF8DA", alignItems: "center", justifyContent: "center", width: "90%", alignSelf: "center", borderRadius: 15, marginTop: 20, marginBottom: 20, borderWidth: 2, borderColor: "#FFE292", }}>

                        <View style={{ position: "absolute", zIndex: 10, top: -35, backgroundColor: "#FFF8DA", height: 70, width: 70, borderRadius: 35, alignItems: "center", justifyContent: "center", borderWidth: 2, borderTopColor: "#FFE292", borderRightColor: "#FFE292", borderBottomColor: "#FFF8DA", borderLeftColor: "#FFF8DA", transform: [{ rotate: '-45deg' }] }}>
                            <SweetSFSymbol name="sparkles" size={32} colors={["#FFC53A"]} style={{ transform: [{ rotate: '45deg' }] }} />
                        </View>

                        <Text style={styles.adviceText}>{advice}</Text>
                    </View>

                    {/* FOOD POLAROIDS */}
                    <View style={{ height: 175, marginBottom: 20, flexDirection: "row", marginTop: 20 }}>
                        <Pressable onPress={() => meals.includes("breakfast") || navigation.navigate('Camera', { mealKey: "breakfast", alertBadPhoto: false })} style={{ width: screenWidth / 3, height: screenHeight / 5, borderColor: "grey", shadowColor: "black", shadowOffset: { "width": 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 14, backgroundColor: "#FFFEF8", transform: [{ rotate: '-10deg' }] }}>
                            <View style={{ width: (screenWidth / 3) - 10, height: (screenWidth / 3) - 10, margin: 5, borderWidth: 2, borderRadius: 5, opacity: 1, borderColor: "#ebebeb", justifyContent: "center", alignItems: "center" }}>
                                {images && images.breakfast && images.breakfast !== "none" ?
                                    <Image
                                        source={{ uri: images.breakfast }}
                                        style={{ width: (screenWidth / 3) - 10, height: (screenWidth / 3) - 10, borderRadius: 5 }}
                                    />

                                    : emojis && emojis.breakfast ?
                                        <Text style={{ fontSize: 62 }}>{emojis.breakfast}</Text>
                                        :
                                        <SweetSFSymbol name="mug" size={62} colors={["#b0b0b0"]} />
                                }
                            </View>
                            <Text style={{ alignSelf: "center", fontFamily: "SpaceGrotesk-Bold", }}>{foods[0] ? foods[0] : "Breakfast"}</Text>
                        </Pressable>
                        <Pressable onPress={() => meals.includes("lunch") || navigation.navigate('Camera', { mealKey: "lunch", alertBadPhoto: false })} style={{ width: (screenWidth / 3), height: (screenHeight / 5), borderColor: "grey", shadowColor: "black", shadowOffset: { "width": 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 14, backgroundColor: "#FFFEF8", bottom: 20 }}>
                            <View style={{ width: (screenWidth / 3) - 10, height: (screenWidth / 3) - 10, margin: 5, borderWidth: 2, borderRadius: 5, opacity: 1, borderColor: "#ebebeb", justifyContent: "center", alignItems: "center" }}>
                                {images && images.lunch && images.lunch != "none" ?
                                    <Image
                                        source={{ uri: images.lunch }}
                                        style={{ width: (screenWidth / 3) - 10, height: (screenWidth / 3) - 10 }}
                                    />
                                    :
                                    emojis && emojis.lunch ?
                                        <Text style={{ fontSize: 62 }}>{emojis.lunch}</Text>
                                        :
                                        <SweetSFSymbol name="sun.max" size={62} colors={["#b0b0b0"]} />
                                }
                            </View>

                            <Text style={{ alignSelf: "center", fontFamily: "SpaceGrotesk-Bold", }}>{foods[1] ? foods[1] : "Lunch"}</Text>
                        </Pressable>
                        <Pressable onPress={() => meals.includes("dinner") || navigation.navigate('Camera', { mealKey: "dinner", alertBadPhoto: false })} style={{ width: (screenWidth / 3), height: (screenHeight / 5), borderColor: "grey", shadowColor: "black", shadowOffset: { "width": 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 14, backgroundColor: "#FFFEF8", transform: [{ rotate: '10deg' }] }}>
                            <View style={{ width: (screenWidth / 3) - 10, height: (screenWidth / 3) - 10, margin: 5, borderWidth: 2, borderRadius: 5, opacity: 1, borderColor: "#ebebeb", justifyContent: "center", alignItems: "center" }}>
                                {images && images.dinner && images.dinner != "none" ?
                                    <Image
                                        source={{ uri: images.dinner }}
                                        style={{ width: (screenWidth / 3) - 10, height: (screenWidth / 3) - 10, borderRadius: 5 }}
                                    />
                                    : emojis && emojis.dinner ?
                                        <Text style={{ fontSize: 62 }}>{emojis.dinner}</Text>
                                        :
                                        <SweetSFSymbol name="moon" size={62} colors={["#b0b0b0"]} />
                                }
                            </View>
                            <Text style={{ alignSelf: "center", fontFamily: "SpaceGrotesk-Bold", }}>{foods[2] ? foods[2] : "Dinner"}</Text>
                        </Pressable>
                    </View>

                    {/* STATS CONTAINER */}
                    <View style={{ alignItems: "center", backgroundColor: "#FFF8DA", alignItems: "center", justifyContent: "center", width: "90%", alignSelf: "center", borderRadius: 15, marginTop: 20, marginBottom: 20, borderWidth: 2, borderColor: "#FFE292", padding: 20}}>
                        <View>
                            <WeeklyGraph datapoints={graphData} />
                        </View>
                    </View>


                    {/* #FFF8DA */}

                    {/* <Pressable onPress={() => navigation.navigate("Feedback")}><Text>Feedback</Text></Pressable> */}
                    <View style={{ flexDirection: "row", paddingBottom: 70, gap: 15, alignSelf: "center", paddingTop: 30 }}>
                        <Pressable style={styles.settingsButton} onPress={() => {
                            // deleteAppleAccount()
                            clearHistory()


                            // newCalculationScore(["hi"])
                        }}>
                            <Text style={styles.settingsText}>Clear Meal History</Text>
                        </Pressable>
                        <Pressable style={styles.logOutButton} onPress={() => auth.signOut()}>
                            <Text style={styles.logOutText}>Log Out</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView >
        );
}

const styles = StyleSheet.create({
    adviceText: {
        fontSize: 18,
        zIndex: 10,
        fontFamily: "SF-Pro-Medium",
        textAlign: "center",
        alignSelf: "center",
        margin: 10,
        marginTop: 30,
        marginBottom: 20
    },
    title: {
        fontFamily: "SF-Rounded",
        fontSize: 35,
        fontWeight: "bold",
        textAlign: "center",
        alignSelf: "center"
    },
    blurb: {
        fontSize: 20,
        fontFamily: "SF-Pro",
        textAlign: "center",
        alignSelf: "center"
    },
    sfcompact: {
        fontSize: 20,
        fontFamily: "SF-Compact",
    },
    sfrounded: {
        fontSize: 30,
        fontFamily: "SF-Rounded",
    },
    sftext: {
        fontSize: 15,
        fontFamily: "SF-Text",
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
    dottedLine: {
        borderColor: "red",
        borderWidth: 1,
        borderStyle: "dashed"
    },
    settingsButton: {
        width: "45%",
        // borderColor: "#130630",
        // borderWidth: 3,
        alignSelf: "center",
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: "center",
        backgroundColor: "#FF6231",
        shadowColor: "#FF6231",
        shadowOpacity: 0.5,
        shadowRadius: 10
    },
    settingsText: {
        fontSize: 15,
        fontFamily: "SF-Compact",
        color: "white",
    },
    logOutButton: {
        borderColor: "#130630",
        borderWidth: 3,
        width: "45%",
        backgroundColor: "#130630",
        alignSelf: "center",
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: "center"
    },
    logOutText: {
        fontSize: 15,
        fontFamily: "SF-Compact",
        color: "white"
    }
});
