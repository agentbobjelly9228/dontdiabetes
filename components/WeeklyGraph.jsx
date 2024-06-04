import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Pressable, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font'
import { Svg, Polyline } from 'react-native-svg';
import { LineChart, } from 'react-native-chart-kit';



export default function WeeklyGraph({ navigation, datapoints }) {
    const screenWidth = Dimensions.get("window").width * 0.9;
    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });



    const chartConfig = {
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        strokeWidth: 2, // optional, default 3
        useShadowColorFromDataset: false, // optional
        color: () => `rgba(0, 0, 0, 1)`,
        propsForLabels: {
            fontFamily: "SF-Compact",
            fontSize: 9

        }
    };

    return (
        <View>
            <View style={{ backgroundColor: "white", height: 100, borderRadius: 45, alignItems: "center", position: "absolute", width: screenWidth, top: 55 }} />
            <LineChart
                data={{
                    labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
                    datasets: [
                        {
                            data: datapoints,
                            color: () => `rgba(255, 255, 255, 1)`,
                            strokeWidth: 11
                        }
                    ],
                }}
                width={screenWidth}
                height={235}
                chartConfig={chartConfig}
                withHorizontalLabels={false}
                withShadow={false}
                fromNumber={5}
                fromZero={true}
                withHorizontalLines={false}
                withVerticalLines={false}
                segments={5}
                xLabelsOffset={7}
                getDotProps={(dataPoint, dataPointIndex) => {
                    return {
                        r: "13",
                    }
                }}

                // withHorizontalLabels={false}
                style={{ position: "absolute" }}


            />
            <LineChart
                data={{
                    labels: ["27", "28", "29", "30", "31", "1", "2"],
                    datasets: [
                        {
                            data: datapoints,
                            color: () => `rgba(0, 0, 0, 1)`,
                            strokeWidth: 6
                        }
                    ],
                }}
                width={screenWidth}
                height={235}
                chartConfig={chartConfig}
                withHorizontalLabels={false}
                withShadow={false}
                fromNumber={5}
                fromZero={true}
                segments={5}
                withHorizontalLines={false}
                withVerticalLines={false}
                xLabelsOffset={18}

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

            // withHorizontalLabels={false}
            // style={{backgroundColor: "red", opacity: 0}}


            />

        </View>
    )

}


const styles = StyleSheet.create({

});