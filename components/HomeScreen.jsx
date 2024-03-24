// In HomeScreen.js
import { useFonts } from "expo-font";
import React from 'react';
import { View, Text, Button, Image, StyleSheet, ImageBackground } from 'react-native';
import HappyGuy from '../assets/happyguy.png'
import happylunchguy from '../assets/happylunchguy.png'
import bars from '../assets/lunchbars.png'

export default function HomeScreen({ navigation }) {
    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });
    if (!fontsLoaded) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={{ flex: 1, backgroundColor: "F5F5F5" }}>
            <Image source={HappyGuy} style={{alignSelf: "center", height: 400, resizeMode: "contain"}} />
            <View style={{ alignItems: "left", marginLeft: 30, marginRight: 30 }}>
                <Text>Hi Teddy,</Text>

                {/* Change to swap based o ntime */}
                <Text style={styles.sfrounded}>BREAKFAST TIME!!!</Text>
                <Text>Let's go! Kick today off with a great start by enjoying your meal. Scan your breakfast to get started!</Text>

                {/* <Image source={bars} style={width: 100%, heighresizeMode="contain" /> */}

            </View>

        </View>

    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 10
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
