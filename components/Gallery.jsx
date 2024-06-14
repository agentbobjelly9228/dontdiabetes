import { useFonts } from "expo-font";
import React from 'react';
import { Text, View, FlatList, Image, Button, StyleSheet, SafeAreaView, Pressable, Dimensions } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Svg, { Path } from 'react-native-svg';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function Gallery({ navigation }) {
    const [foods, setFoods] = useState([]);
    const [angle, setAngle] = useState("1deg");
    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
        "Caveat-Bold": require("../assets/fonts/Caveat-Bold.ttf"),
        "Caveat-Medium": require("../assets/fonts/Caveat-Medium.ttf"),
        "Caveat-Regular": require("../assets/fonts/Caveat-Regular.ttf"),
        "Caveat-SemiBold": require("../assets/fonts/Caveat-SemiBold.ttf"),
    });

    const [selectedItem, setSelectedItem] = useState(null);

    async function getData() {
        let savedData = JSON.parse(await AsyncStorage.getItem('@allFoods'));
        setFoods(savedData);
    }
    useFocusEffect(
        useCallback(() => {
            getData();
            if (foods)
                setFoods(foods.reverse())
        }, [])
    );


    const bottomSheetRef = React.useRef(null);


    function prepareBottomSheet(item) {
        // Angle for photo
        let number = Math.round(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1)
        setAngle(number + "deg")

        // Set selected item
        setSelectedItem(item)

        // Open bottom sheet
        bottomSheetRef.current.snapToIndex(0)

        console.log(item)

    }


    if (!fontsLoaded) {
        return <Text>Loading...</Text>;
    }


    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ flex: 1, margin: 10 }}>
                <View style={{ padding: 20, flexDirection: "row", alignSelf: "flex-start" }}>
                    <Text style={styles.sfroundedbig}>Gallery</Text>

                </View>
                <FlatList
                    data={foods}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    renderItem={({ item }) => (<>
                        <Pressable style={styles.container}
                            onPress={() => {
                                prepareBottomSheet(item)
                            }}>
                            <Image resizeMode="cover" source={{ uri: item.image }} style={styles.image} />
                            <Text style={styles.sfrounded} numberOfLines={2} ellipsizeMode='tail'>
                                {item.description}
                            </Text>
                        </Pressable>
                    </>
                    )}
                />
            </View
            >
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={['90%']}
                enablePanDownToClose={true}
                backgroundStyle={styles.bottomSheetBg}
                index={-1}
            >
                <BottomSheetView style={styles.bottomSheetContent}>
                    <Text style={styles.sfroundedbig}>Info</Text>
                    <View style={{ justifyContent: 'center', alignItems: "center", }}>
                        <Svg height={10} width={75}>
                            <Path
                                d="M1.01929 4.3045C3.45133 0.413228 5.88338 0.413228 8.31543 4.3045C10.7475 8.19578 13.1795 8.19578 15.6116 4.3045C18.0436 0.413228 20.4757 0.413228 22.9077 4.3045C25.3398 8.19578 27.7718 8.19578 30.2039 4.3045C32.6359 0.413228 35.068 0.413228 37.5 4.3045C39.932 8.19578 42.3641 8.19578 44.7961 4.3045C47.2282 0.413228 49.6602 0.413228 52.0923 4.3045C54.5243 8.19578 56.9564 8.19578 59.3884 4.3045C61.8205 0.413228 64.2525 0.413228 66.6846 4.3045C69.1166 8.19578 71.5487 8.19578 73.9807 4.3045"
                                stroke="black"
                                strokeWidth="2"
                                fill="none"
                                style={{ justifyContent: "center" }}
                            />
                        </Svg>
                    </View>
                    <View style={{ ...styles.imgFrame, transform: [{ rotate: angle }] }}>
                        <Image source={{ uri: selectedItem?.image }} style={styles.previewImage} />
                        <Text style={styles.description}>
                            {selectedItem?.food}
                        </Text>
                    </View>
                    <View style={ styles.bottomSheetText }>
                        <Text style={{fontSize: 70, transform: [{rotate: "80deg"}], position: 'absolute', left: 40, top: 10 }}>
                            {selectedItem?.emoji}
                        </Text>
                        <Text style={{fontSize: 60, transform: [{rotate: "1deg"}], position: 'absolute', right: 30, top: 20 }}>
                            {selectedItem?.emoji}
                        </Text>
                        <Text style={{fontSize: 60, transform: [{rotate: "-100deg"}], position: 'absolute', left: 180, top: 50 }}>
                            {selectedItem?.emoji}
                        </Text>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>
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
        fontSize: 15,
        fontFamily: "SF-Rounded",
        textAlign: 'center',
        marginHorizontal: 5,
    },

    sfroundedbig: {
        fontSize: 30,
        fontFamily: "SF-Rounded",
        textAlign: "center",
        marginBottom: 10
    },
    sftext: {
        fontSize: 15,
        fontFamily: "SF-Text",
    },
    container: {
        padding: 10,
        margin: 10,
        width: "44%",
        height: 250,
        backgroundColor: "white",
        borderRadius: 5,
        gap: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    image: {
        aspectRatio: 1,
        height: "65%"
    },
    bottomSheetBg: {
        backgroundColor: "#FFCC26"
    },
    bottomSheetContent: {
        margin: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    previewImage: {
        width: 300,
        height: 300,
        borderRadius: 3,
    },
    imgFrame: {
        backgroundColor: "white",
        padding: 8,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        gap: 10,
        position: "absolute",
        top: windowHeight * 0.1,
        justifyContent: "center",
        alignItems: "center"
    },
    description: {
        fontSize: 30,
        textAlign: "center",
        fontFamily: "Caveat-Bold",
        width: 300
    },
    bottomSheetText: {
        width: windowWidth * 0.9, 
        position: "absolute", 
        top: windowHeight * 0.53, 
        flexDirection: "row", 
        justifyContent: "center", 
        alignItems: "center", 
        gap: 15,
    },
});