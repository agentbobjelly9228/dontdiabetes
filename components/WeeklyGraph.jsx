import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Pressable, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font'
import { Svg, Polyline } from 'react-native-svg';
import { LineChart, } from 'react-native-chart-kit';




function Dot() {
    return (
        <View style={{ backgroundColor: "white", width: 25, height: 25, position: "absolute", top: 80, borderRadius: 15, justifyContent: "center", alignItems: "center" }} >
            <View style={{ backgroundColor: "black", width: 15, height: 15, zIndex: 1, borderRadius: 10, }} />
        </View>
    )
}



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
        color: () => `rgba(0, 0, 0, 0)`,
    };

    return (
        <View>
            <View style={{ backgroundColor: "white", height: 100, borderRadius: 45, alignItems: "center", position: "absolute", width: screenWidth, top: 55 }} />
            <LineChart
                data={{
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
                withVerticalLabels={false}
                withShadow={false}
                fromNumber={5}
                fromZero={true}
                segments={5}
                getDotProps={(dataPoint, dataPointIndex) => {
                    return {
                        r: "13",
                    }
                }}

                // withHorizontalLabels={false}
                style={{position: "absolute"}}
                
                
            />
            <LineChart
                data={{
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
                withVerticalLabels={false}
                withShadow={false}
                fromNumber={5}
                fromZero={true}
                segments={5}
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