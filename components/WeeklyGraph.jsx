import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Pressable, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font'
import { Svg, Polyline } from 'react-native-svg';
import { LineChart, } from 'react-native-chart-kit';
import { ref, update, get, remove, onValue } from 'firebase/database';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { FIREBASE_DATABASE } from '../FirebaseConfig';

const dayjs = require("dayjs")

const indexToDayName = {
    0: "SUN",
    1: "MON",
    2: "TUE",
    3: "WED",
    4: "THU",
    5: "FRI",
    6: "SAT"
}

export default function WeeklyGraph({ navigation, datapoints, yellow = false }) {
    const auth = FIREBASE_AUTH;
    const database = FIREBASE_DATABASE;

    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    datapoints = datapoints.slice(-7);
    // console.log(datapoints)

    // datapoints = [{"date": "\"2024-07-31T07:00:00.000Z\"", "score": 2.5}]

    let scores = []
    let dayNums = []
    let dayNames = []
    datapoints.forEach((item) => {
        scores.push(item.score)
        let dateObject = dayjs(JSON.parse(item.date))
        dayNames.push(indexToDayName[dateObject.day()])
        dayNums.push(dateObject.date())
    })
    // console.log(scores)
    // console.log(dayNames)
    // console.log(dayNums)

    useEffect(() => {
        if (scores.length == datapoints.length ) {
            if (scores.length != 0)
                getWeeklyReviewComment(scores)
        }
    }, [scores])

    const chartConfig = {
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        strokeWidth: 2,
        useShadowColorFromDataset: false,
        color: () => yellow ? `#FFCC32` : 'rgba(0, 0, 0, 1)',
        propsForLabels: {
            fontFamily: "SF-Compact",
            fontSize: 9
        }
    };

    // Should move to daily review so this isn't called every time the user switches to this in the home screen...
    function getWeeklyReviewComment(scores) {

        let weeklyReviewComment = "It's your weekly review!"
    
        // scores = [1, 1, 2, 3, 0, 2, 0]

        // Most recent out of ideal area
        if (scores[scores.length - 1] == 0 || scores[scores.length - 1] == 5) {
            weeklyReviewComment = "Today was unlucky! Make it a priority to do great tomorrow."
        }
        
        // 2+ recent out of ideal area
        if (scores.slice(-2).every(a => a == 0 || a == 5)) {
            weeklyReviewComment = "Tough day again. Shrug it off and bounce back tomorrow."
        }
    
        // Most recent in ideal area after previous was out of ideal area - back on track
        if (!(scores[scores.length - 1] == 0 || scores[scores.length - 1] == 5) && (scores[scores.length - 2] == 0 || scores[scores.length - 2] == 5)) {
            weeklyReviewComment = "Nice work today! You're back on your streak. Congratulations!"
        }
    
        // 2+ recent in ideal area
        if (scores.slice(-2).every(a => a > 0 && a < 5)) {
            weeklyReviewComment = "Amazing effort today! Keep up the good work. Your body thanks you!"
        }
     
        // 7 recent in ideal area - amazing streak!
        if (scores.every(a => a > 0 && a < 5)) {
            weeklyReviewComment = "What an INCREDIBLE streak!! Your commitment is unrivaled."
        }
    
        // First day
        if (scores.length == 1) {
            weeklyReviewComment = "Here's to Day One! Your journey begins now. It's that simple!"
        }

        // console.log(weeklyReviewComment)
        update(ref(database, auth.currentUser.uid), { weeklyReviewComment: weeklyReviewComment })
    
    }
    

    return (
        <View style={{ zIndex: 1000000 }}>
            <View style={{ gap: 10, top: 8, position: "absolute", width: screenWidth * 0.85, alignSelf: "center", paddingBottom: 0 }}>
                <View style={{ backgroundColor: "#FFEFBC", height: 15, borderRadius: 15, alignItems: "center", padding: 0 }} />
                <View style={{ backgroundColor: "#FFCC26", height: 100, borderRadius: 15, alignItems: "center", justifyContent: "center", margin: 0 }}>
                    {datapoints.length === 0 ? <Text style={{ fontSize: 16, width: "60%", textAlign: "center", color: "black", opacity: 0.5 }}>An empty canvas to document your growth.</Text> : null}
                </View>
                <View style={{ backgroundColor: "#FFEFBC", height: 15, borderRadius: 15, alignItems: "center", }} />
            </View>
            <LineChart
                data={{
                    labels: dayNames,
                    datasets: [
                        {
                            data: scores,
                            color: () => `rgba(255, 204, 38, 1)`,
                            strokeWidth: 11
                        }
                    ],
                }}
                width={screenWidth}
                height={180}
                chartConfig={chartConfig}
                withHorizontalLabels={false}
                withShadow={false}
                fromNumber={5}
                fromZero={true}
                withHorizontalLines={false}
                withVerticalLines={false}
                segments={5}
                xLabelsOffset={5}
                getDotProps={(dataPoint, dataPointIndex) => {
                    return {
                        r: "13",
                    }
                }}

                style={{ position: "absolute", left: -10 }}


            />
            <LineChart
                data={{
                    labels: dayNums,
                    datasets: [
                        {
                            data: scores,
                            color: () => `rgba(0, 0, 0, 1)`,
                            strokeWidth: 6
                        }
                    ],
                }}
                width={screenWidth}
                height={180}
                chartConfig={chartConfig}
                withHorizontalLabels={false}
                withShadow={false}
                fromNumber={5}

                fromZero={true}
                segments={5}
                withHorizontalLines={false}
                withVerticalLines={false}
                xLabelsOffset={15}

                getDotProps={(dataPoint, dataPointIndex) => {
                    // if (dataPointIndex == 6) {
                    //     return {
                    //         r: "11",
                    //         strokeWidth: 5,
                    //         stroke: "green",
                    //     }
                    // }
                    return {
                        r: "8",
                        color: "black",

                    }
                }}
                style={{ left: -10, bottom: 0 }}


            // withHorizontalLabels={false}
            // style={{backgroundColor: "red", opacity: 0}}


            />

        </View>
    )

}


const styles = StyleSheet.create({

});