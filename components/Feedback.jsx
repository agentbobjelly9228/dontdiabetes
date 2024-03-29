import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font'

export default function Feedback({ navigation }) {
    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    const [score, setScore] = useState(0);
    const [avgGI, setGI] = useState(0);
    const [numMeals, setNumMeals] = useState(null);


    useEffect(() => {
        setScore(0)
        getData();
    }, [])

    useEffect(() => {
        if (numMeals && numMeals 2!== 3)
            setTimeout(() => navigation.navigate("Home"), 3000);
    }, [numMeals])

    async function getData() {
        const savedDataStr = await AsyncStorage.getItem('@totalMacros');
        const savedData = JSON.parse(savedDataStr);
        console.log(savedData.GIs)
        var temp = 0;
        for (let i = 0; i < savedData.GIs.length; i++) {
            temp += savedData.GIs[i]
        }
        setGI(temp / savedData.GIs.length);
        if (savedData) {
            calculateFoodScore(savedData);
        }

        setNumMeals(savedData.numMeals)
    }

    function calculateFoodScore(data) {
        let optimalCal = 2000.0;
        let optimalFruits = 2.0;
        let optimalVeg = 3.0;
        let optimalGrain = 4.0;
        let optimalProtein = 6.5;
        let optimalDairy = 3.0;
        let optimal = [optimalCal, optimalFruits, optimalVeg, optimalGrain, optimalProtein, optimalDairy];

        let eaten = [data.kcal, data.fruit, data.vegetables, data.grains, data.protein, data.dairy];
        let totalPercentage = 0;

        optimal.forEach((optimalValue, index) => {
            let leeway = 0.1; // Extra 10% leeway
            let percentage = eaten[index] / optimalValue;
            if (Math.abs(1 - percentage) < leeway) {
                percentage = 1;
            } else {
                if (percentage < 1) {
                    percentage += leeway;
                } else if (percentage > 1) {
                    percentage -= leeway;
                    percentage = 2 - percentage;
                }
            }
            if (percentage < 0) {
                percentage = 0;
            }

            totalPercentage += percentage;
        });

        let avgPercentage = totalPercentage / optimal.length;
        console.log(avgPercentage)
        setScore(avgPercentage);
    }






    if (numMeals != 3) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
                <View style={styles.container}>
                    <Text style={styles.title}>Enjoy your meal!</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
            <View style={styles.container}>
                <Text style={styles.title}>Let's Recap</Text>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { height: `${score * 100}%` }]} />
                </View>
                <Text>Score: {Math.round(score * 100)}%</Text>
                <Text>Average GI index: {avgGI}</Text>
                {avgGI <= 55 ? <Text> Your average meal is diabetic friendly</Text> : <Text>Your average meal is not diabetic friendly</Text>}
            </View>
            <Button title="Go back home" onPress={() => navigation.navigate("Home")} />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: "SF-Rounded",
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
});