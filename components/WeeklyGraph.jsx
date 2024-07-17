import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Pressable, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font'
import { Svg, Polyline } from 'react-native-svg';
import { LineChart, } from 'react-native-chart-kit';

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
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    datapoints = datapoints.slice(-7);
    // console.log(datapoints)

    let scores = []
    let dayNums = []
    let dayNames = []
    datapoints.forEach((item) => {
        scores.push(item.score)
        let dateObject = dayjs(JSON.parse(item.date))
        dayNames.push(indexToDayName[dateObject.day()])
        dayNums.push(dateObject.date())
    })
    console.log(scores)
    console.log(dayNames)
    console.log(dayNums)

    const chartConfig = {
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        strokeWidth: 2, // optional, default 3
        useShadowColorFromDataset: false, // optional
        color: () => yellow ? `#FFCC32` : 'rgba(0, 0, 0, 1)',
        propsForLabels: {
            fontFamily: "SF-Compact",
            fontSize: 9
        }
    };

    return (
        <View>
            <View style={{ gap: 5, top: 0, position: "absolute", width: screenWidth * 0.85, alignSelf: "center", paddingBottom: 0 }}>
                <View style={{ backgroundColor: "#FFEFBC", height: 15, borderRadius: 15, alignItems: "center", padding: 0 }} />
                <View style={{ backgroundColor: "#FFCC26", height: 100, borderRadius: 15, alignItems: "center", justifyContent: "center", margin: 0 }}>
                    {datapoints.length === 0 ? <Text style={{ fontSize: 18, width: "70%", textAlign: "center" }}>Scan your first few meals to receive insights tonight.</Text> : null}
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
                height={200}
                chartConfig={chartConfig}
                withHorizontalLabels={false}
                withShadow={false}
                fromNumber={1.25}
                fromZero={true}
                withHorizontalLines={false}
                withVerticalLines={false}
                segments={3}
                xLabelsOffset={-10}
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
                height={215}
                chartConfig={chartConfig}
                withHorizontalLabels={true}
                withShadow={false}
                fromNumber={1.25}
                fromZero={true}
                segments={3}
                withHorizontalLines={true}
                withVerticalLines={false}
                xLabelsOffset={0}

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