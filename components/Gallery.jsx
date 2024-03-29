import { useFonts } from "expo-font";
import React from 'react';
import { Text, View, FlatList, Image, Button, StyleSheet, SafeAreaView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Gallery({ navigation }) {
    const [images, setImages] = useState([]);
    async function getData() {
        let savedData = JSON.parse(await AsyncStorage.getItem('@totalMacros'));
        setImages(savedData.images)
        // console.log(savedData.images)

    }
    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });
    if (!fontsLoaded) {
        return <Text>Loading...</Text>;
    }

    useEffect(() => {
        getData();
    })
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <FlatList
                    data={images}
                    renderItem={({ item }) => (<>
                        <View style={{ backgroundColor: "white", margin: 20, marginHorizontal: 10, paddingBottom: 50, borderRadius: 15 }}>
                            <Image source={{ uri: item }} style={styles.image} />
                            <Text style={styles.sfrounded}>We don't have time</Text>
                        </View>

                    </>
                    )}
                    numColumns={2} // Adjust the number of columns for your desired grid layout
                    contentContainerStyle={styles.galleryContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 150, // Example width
        height: 150, // Example height
        margin: 5, // Optional: Adds space between images
        borderRadius: 10,
    },
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
        fontSize: 20,
        fontFamily: "SF-Rounded",
    },
    sfroundedbig: {
        fontSize: 30,
        fontFamily: "SF-Rounded",
    },
    sftext: {
        fontSize: 15,
        fontFamily: "SF-Text",
    },

});