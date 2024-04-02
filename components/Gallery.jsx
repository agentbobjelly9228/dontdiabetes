import { useFonts } from "expo-font";
import React from 'react';
import { Text, View, FlatList, Image, Button, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function Gallery({ navigation }) {
    const [foods, setFoods] = useState([]);
    async function getData() {
        let savedData = JSON.parse(await AsyncStorage.getItem('@totalMacros'));
        // var temp = [];

        // for (let i = 0; i < savedData.images.length; i++) {
        //     temp.push({ "image": savedData.images[i], "description": savedData.foods[i] })
        // }
        // setFoods(temp)
        console.log(savedData.foods)
        setFoods(savedData.foods);
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

    useFocusEffect(
        useCallback(() => {
            getData();

        }, [])
    );

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <FlatList
                    data={foods}
                    renderItem={({ item }) => (<>
                        <Pressable onPress={() => {
                            navigation.navigate("macroPage", item)
                        }}>
                            <View style={styles.container}>
                                <Image source={{ uri: item.image }} style={styles.image} />
                                <Text style={styles.sfrounded} numberOfLines={2} ellipsizeMode='tail'>
                                    {item.description}
                                </Text>
                            </View>
                        </Pressable>


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
        textAlign: 'center', // Ensure text is centered
        marginHorizontal: 5, // Add horizontal margin for padding
    },

    sfroundedbig: {
        fontSize: 30,
        fontFamily: "SF-Rounded",
    },
    sftext: {
        fontSize: 15,
        fontFamily: "SF-Text",
    },
    container: {
        backgroundColor: "white",
        margin: 20,
        marginHorizontal: 10,
        paddingBottom: 50,
        borderRadius: 15,
        width: 160, // Adjusted to fit the image width plus some padding
        alignItems: 'center', // Center align the items
    },

});