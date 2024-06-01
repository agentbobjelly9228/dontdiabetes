import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font'
import WeeklyGraph from './WeeklyGraph';

export default function Feedback({ navigation }) {
    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    const [scores, setScores] = useState([]);
    const [avgGI, setGI] = useState(0);
    const [numMeals, setNumMeals] = useState(null);
    const [page, setPage] = useState(0);


    useEffect(() => {
        handleData();

        // Get Stored Scores

    }, [])

    useEffect(() => {
        if (numMeals && numMeals !== 3)
            setTimeout(() => navigation.navigate("Home"), 3000);
    }, [numMeals])


    async function handleData() {
        // Get all previous scores
        // await AsyncStorage.setItem('@allScores', JSON.stringify([1, 2.2, 4.3, 1.2, 3.5, 3.1]))

        // Get all data from today
        const savedDataStr = await AsyncStorage.getItem('@todayMacros');
        const savedData = JSON.parse(savedDataStr);

        setNumMeals(savedData.numMeals)

        if (savedData.numMeals >= 3) {
            let allScores = await AsyncStorage.getItem('@allScores');
            // console.log(allScores)
            let parsedScores = allScores ? JSON.parse(allScores) : []

            // Add today's score to all scores, set displayed scores to last 7 days
            let position = calculateFoodScore(savedData);
            console.log("Position: " + position);
            parsedScores.push(position);
            setScores(parsedScores.slice(-7));

            // Update AsyncStorage
            await AsyncStorage.setItem('@allScores', JSON.stringify(parsedScores));


            console.log(savedData.GIs)
            var temp = 0;
            for (let i = 0; i < savedData.GIs.length; i++) {
                temp += savedData.GIs[i]
            }
            setGI(temp / savedData.GIs.length);
        }
    }



    function calculateFoodScore(data) {
        let optimalCal = 2000.0;
        let optimalFruits = 2.0;
        let optimalVeg = 3.0;
        let optimalGrain = 4.0;
        let optimalProtein = 6.5;
        let optimalDairy = 3.0;
        let optimal = [optimalCal, optimalFruits, optimalVeg, optimalGrain, optimalProtein, optimalDairy];
        // console.log(optimal)
        let eaten = [data.kcal, data.fruit, data.vegetables, data.grains, data.protein, data.dairy];
        // console.log(eaten)
        let totalError = 0;

        let leeway = 0.5; // Extra 20% leeway for each error
        let totalLeeway = leeway * optimal.length

        optimal.forEach((optimalValue, index) => {
            let error = Math.abs((eaten[index] - optimalValue) / optimalValue);
            // console.log("Error for " + index + ": " + error)
            totalError += error;
        })

        var position = 2.5 // midpoint

        console.log("Total Error: " + totalError)
        // Calculate position of point on WeeklyGraph
        if (totalError <= totalLeeway) {
            if (data.kcal >= optimalCal) // Error above center
                position += ((totalError / totalLeeway) * 1.5)
            else // Error below center
                position -= ((totalError / totalLeeway) * 1.5)
        } else {
            // Curve data
            // totalError = 0.2
            if (data.kcal >= optimalCal)
                position += 1.5 + (Math.atan(totalError / totalLeeway) / 2) / (Math.PI / 2)
            else
                position -= 1.5 + Math.atan(totalError / totalLeeway) / (Math.PI / 2)
        }

        return position
    }






    if (numMeals != 3) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
                <View style={styles.container}>
                    <Text style={styles.title}>Enjoy your meal!</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (page == 0)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
                <View style={styles.container}>
                    <Text style={styles.titleEmoji}>🙌</Text>
                    <Text style={styles.title}>Let's Recap!</Text>
                    {/* <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { height: `${score * 100}%` }]} />
                    </View>
                    <Text>Score: {Math.round(score * 100)}%</Text>
                    <Text>Average GI index: {avgGI}</Text>
                    {avgGI <= 55 ? <Text> Your average meal is diabetic friendly</Text> : <Text>Your average meal is not diabetic friendly</Text>} */}
                    <View style={{ height: 200 }}>
                        <WeeklyGraph datapoints={scores} />
                    </View>

                    <View style={{ gap: 10 }}>
                        <Text style={styles.blurbTitle}>Wonderful job today!</Text>
                        <Text style={styles.blurbText}>You're continuing your commitment to long-term health and happiness, so pat yourself on the back! </Text>
                    </View>

                </View>

                <Pressable onPress={() => setPage(page + 1)}>
                    <Text style={styles.feedbackButton} >
                        Next
                    </Text>
                </Pressable>
                {/* <Button title="Go back home" onPress={() => navigation.navigate("Home")} /> */}
            </SafeAreaView>
        );

    if (page == 1)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
                <View style={styles.container}>
                    <Text style={styles.title}>Tomorrow...</Text>
                    <View style={{ rowGap: 20 }}>
                        <Text style={styles.blurbTitle}>Enjoy yourself.</Text>
                        <Text style={styles.blurbText}>Try to eat some berries!</Text>
                        <Text style={styles.blurbText}>Continue eating lots of protein!</Text>
                        <Text style={styles.blurbText}>Consider drinking a glass of milk.</Text>
                    </View>
                </View>

                <Pressable onPress={() => setPage(page + 1)}>
                    <Text style={styles.feedbackButton} >
                        Next
                    </Text>
                </Pressable>
                {/* <Button title="Go back home" onPress={() => navigation.navigate("Home")} /> */}
            </SafeAreaView>
        );

    if (page == 2)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
                <View style={styles.container}>
                    <Text style={styles.title}>And remember...</Text>
                    <View style={{ rowGap: 20 }}>
                        <Text style={styles.blurbText}>Your most important sale in life is to sell yourself to yourself.</Text>
                        <Text style={styles.blurbText}>- Maxwell Maltz</Text>
                    </View>
                </View>

                <Pressable onPress={() => navigation.navigate("Home")}>
                    <Text style={styles.feedbackButton} >
                        See you tomorrow!
                    </Text>
                </Pressable>
                {/* <Button title="Go back home" onPress={() => navigation.navigate("Home")} /> */}
            </SafeAreaView>
        );

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 50,
        marginRight: 50,
    },
    titleEmoji: {
        fontSize: 80,
        fontWeight: 'bold',
        fontFamily: "SF-Rounded",
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: "SF-Rounded",
        color: "#FFCC26"
    },
    feedbackButton: {
        borderColor: "#716694",
        borderWidth: 2,
        fontSize: 20,
        color: "white",
        textAlign: "center",
        alignSelf: "center",
        padding: 10,
        borderRadius: 10,
        bottom: 100
    },

    progressBarContainer: {
        width: 40, // Width of the progress bar
        height: 200, // Total height of the progress bar container
        borderColor: '#000',
        borderWidth: 2,
        borderRadius: 20, // Optional: if you want rounded corners for the progress bar
        justifyContent: 'flex-end', // This aligns the progress bar to the bottom of the container
        marginBottom: 20,
    },
    progressBar: {
        width: '100%',
        backgroundColor: '#4CAF50', // Progress bar color
    },
    blurbTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: "SF-Rounded",
        color: "#A29CAF",
        textAlign: "center"
    },
    blurbText: {
        fontSize: 15,
        fontFamily: "SF-Text",
        color: "#A29CAF",
        textAlign: "center",
    },
});