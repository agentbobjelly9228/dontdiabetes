import { useFonts } from "expo-font";
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import DashedLine from 'react-native-dashed-line';
import { FIREBASE_DATABASE } from '../FirebaseConfig';
import { ref, set, get } from 'firebase/database';
import greenGuy from '../assets/mascots/greenGuy.png';
import yellowGuy from '../assets/mascots/yellowGuy.png';
import redGuy from '../assets/mascots/redGuy.png';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import ProgressBar from "./ProgressBar";
import WeeklyGraph from "./WeeklyGraph";

const dayjs = require('dayjs')


export default function HomeScreen({ route, navigation }) {
    const auth = FIREBASE_AUTH;
    const database = FIREBASE_DATABASE;
    const [loading, setLoading] = useState(true);
    const [emojis, setEmojis] = useState([]);
    const [graphData, setGraphData] = useState([]);
    const [mascot, setMascot] = useState("");
    const [themeColor, setTheme] = useState("");
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    // const [uid, setUID] = useState("");
    const [currentMeal, setCurrentMeal] = useState(0)

    // Assumes user has breakfast at 8, lunch at 12, and dinner at 18
    const [preferredMealTimes, setTimes] = useState({ "breakfast": 8, "lunch": 12, "dinner": 18 })

    const { logOut } = route.params;
    console.log("thing" + logOut)
    // AsyncStorage.clear()
    // Change to logic include time of day
    async function getGraphData(uid) {
        console.log(uid + "sup")
        let snapshot = await get(ref(database, uid))

        if (snapshot.exists()) {
            const allScores = snapshot.val();
            setGraphData(allScores);
        } else {
            console.log("No data available");
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
            setSubtitle("And that's the end of the today! But it looks like you haven't logged your entire day yet. What'd you eat? We're curious!")
            setCurrentMeal(2);
        } else if (hour >= preferredMealTimes["dinner"] - 1) {
            setTitle("Time for Dinner!");
            setSubtitle("Take some time to relax. Enjoy your meal, savor those veggies, and know that you are valuable just the way you are. Go you!");
            setMascot(redGuy);
            setTheme("#F3B15B");;
            setCurrentMeal(2);
        } else if (hour >= preferredMealTimes["lunch"] - 1) {
            setTitle("It's Lunch Time!");
            setSubtitle("Woohoo! Let's set the tone for today and make it a good one. Pay attention to your hunger cues but don't stress out. You're already doing great!");
            setMascot(yellowGuy);
            setTheme("#F1CF48");
            setCurrentMeal(1);
        } else {
            setTitle("BREAKFAST TIME!!!!");
            setSubtitle("Let's go! Kick today off with a great start by enjoying your meal. Scan your breakfast to get started!");
            setMascot(greenGuy);
            setTheme("#A8C84C");
            setCurrentMeal(0);
        }
    }


    // TODO: Add reset on new day
    useFocusEffect(
        React.useCallback(() => {
            const getAsyncData = async () => {
                let savedData = await AsyncStorage.getItem('@todayMacros');
                AsyncStorage.getItem("@uid").then((savedUID) => {

                    getGraphData(savedUID);

                });
                let macros = savedData ? JSON.parse(savedData) : null;

                // Set title, subtitle, mascot, and theme
                let hour = dayjs().hour();
                let meals = []
                if (macros)
                    meals = Object.keys(macros?.foods)

                setMessages(hour, meals)
                setEmojis(macros?.emojis);
                setLoading(false)
            }
            getAsyncData();
            // getGraphData();
        }, [])


    );

    const handleSheetChanges = React.useCallback((index) => {
        console.log('handleSheetChanges', index);
    }, []);

    const bottomSheetRef = React.useRef(null);


    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    if (!loading)
        return (
            <ScrollView style={{ flex: 1, backgroundColor: "F5F5F5" }}>

                <Image source={mascot} style={{ alignSelf: "center", height: 350, resizeMode: "contain" }} />
                <View style={{ alignItems: "left", marginLeft: 23, marginRight: 23, paddingBottom: 30 }}>
                    <Text style={styles.blurb}>Hi Teddy,</Text>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.blurb}>{subtitle}</Text>
                </View>

                <View style={{ height: 175, marginBottom: 20 }}>
                    <ProgressBar
                        stage={currentMeal}
                        color={themeColor}
                        emojis={emojis}
                    />
                </View>
                <View style={{ height: 300, alignItems: "center", }}>
                    <DashedLine dashLength={7} dashGap={4} dashThickness={1} style={{ width: "90%", opacity: 0.38, position: "absolute" }} />
                    <View style={{ position: "absolute" }}>
                        <WeeklyGraph datapoints={graphData} />
                    </View>
                    <DashedLine dashLength={7} dashGap={4} dashThickness={1} style={{ width: "90%", opacity: 0.38, position: "absolute", top: 205 }} />
                </View>

                {/* <Button title="Thing" onPress={() => navigation.navigate("Feedback")} /> */}
                <Button title="Log out" onPress={async () => {
                    logOut()

                }
                }></Button>
                <Pressable onPress={() => {
                    // navigation.navigate("Feedback")
                }} style={{ padding: 100, }}><Text>Thing</Text></Pressable>

            </ScrollView>
        );
}

const styles = StyleSheet.create({
    title: {
        fontFamily: "SF-Rounded",
        fontSize: 30,
        fontWeight: "bold",
        marginTop: 5,
        marginBottom: 5
    },
    blurb: {
        fontSize: 15,
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
    }
});
