// In HomeScreen.js
import { useFonts } from "expo-font";
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';


import greenGuy from '../assets/mascots/greenGuy.png';
import yellowGuy from '../assets/mascots/yellowGuy.png';
import redGuy from '../assets/mascots/redGuy.png';

import ProgressBar from "./ProgressBar";


export default function HomeScreen({ navigation }) {
    const [loading, setLoading] = useState(true)
    const [emojis, setEmojis] = useState([])
    const [numMeals, setNumMeals] = useState(0)
    const [mascot, setMascot] = useState("");
    const [themeColor, setTheme] = useState("");
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("")


    // Change to logic include time of day
    const setMessages = (numMeals) => {
        if (numMeals == 0) {
            setTitle("BREAKFAST TIME!!!!");
            setSubtitle("Let's go! Kick today off with a great start by enjoying your meal. Scan your breakfast to get started!");
            setMascot(greenGuy);
            setTheme("#A8C84C");
        } else if (numMeals == 1) {
            setTitle("It's Lunch Time!");
            setSubtitle("Woohoo! Let's set the tone for today and make it a good one. Pay attention to your hunger cues but don't stress out. You're already doing great!");
            setMascot(yellowGuy);
            setTheme("#F1CF48");
        } else if (numMeals == 2) {
            setTitle("Time for Dinner!");
            setSubtitle("Take some time to relax. Enjoy your meal, savor those veggies, and know that you are valuable just the way you are. Go you!");
            setMascot(redGuy);
            setTheme("#F3B15B")
        } else {
            setTitle("What a Good Day!")
            setMascot(greenGuy);
            setTheme("#A8C84C");
            setSubtitle("You've done it! Enjoy the rest of your day.")
        }
    }


    // Add reset on new day
    useFocusEffect(
        React.useCallback(() => {
            const getAsyncData = async () => {
                let savedData = await AsyncStorage.getItem('@totalMacros');
                let macros = savedData ? JSON.parse(savedData) : null;
                if (macros) {
                    if (macros.emojis) {
                        setEmojis(macros.emojis);
                    } else {
                        setEmojis([" ", " ", " "]);
                    }

                    setNumMeals(macros.numMeals);
                    setMessages(macros.numMeals);
                } else {
                    setMessages(0);
                }

                setLoading(false)
            }
            getAsyncData()
        }, [])
    );



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

                <ProgressBar
                    stage={numMeals}
                    color={themeColor}
                    emojis={emojis}
                />

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
});
