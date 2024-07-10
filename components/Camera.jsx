import { StyleSheet, Text, View, Button, Image, Pressable, Dimensions, TextInput, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { AutoFocus, Camera, CameraType } from 'expo-camera/legacy';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from "expo-font";
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutUp, SlideInDown, SlideOutDown, SlideOutLeft, useSharedValue, useAnimatedStyle, withSpring, cancelAnimation } from "react-native-reanimated";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleGenerativeAI } from '@google/generative-ai';

import SweetSFSymbol from "sweet-sfsymbols";

import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lifebuoy, GalleryAdd, ArrowRotateRight, Back, Text as TextIcon, ArrowDown2, Sun1, Moon, Coffee, Grammerly } from 'iconsax-react-native';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function CameraPage({ route, navigation }) {


    const { mealKey, alertBadPhoto } = route.params;

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
        "Caveat-Bold": require("../assets/fonts/Caveat-Bold.ttf"),
        "Caveat-Medium": require("../assets/fonts/Caveat-Medium.ttf"),
        "Caveat-Regular": require("../assets/fonts/Caveat-Regular.ttf"),
        "Caveat-SemiBold": require("../assets/fonts/Caveat-SemiBold.ttf"),
        "SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
        "SpaceGrotesk-SemiBold": require("../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
        "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
    });

    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const cameraRef = useRef(null);
    const [cameraOpen, setOpen] = useState(true);
    const [bounceValue, setBounceValue] = useState(true);

    const meals = ['breakfast', 'lunch', 'dinner']
    const [currentMealKey, setMealKey] = useState(null)
    const [showMealList, setShowMealList] = useState(null)
    const [awaitingResponse, setAwaitingResponse] = useState(false)
    const [error, setError] = useState(null)

    const [mealsEaten, setMealsEaten] = useState(null)

    const [text, setText] = useState(null);


    function createAlert() {
        Alert.alert('Retake Your Photo', "We couldn't detect any food in the photo you took. Please try again!", [
            { text: 'OK' },
        ]);
    }


    const bottomSheetRef = useRef(null);

    function openTextSheet() {
        bottomSheetRef.current.snapToIndex(0);
    }


    function trimForJson(input) {
        const match = input.match(/\{.*\}/s);
        return match ? match[0] : null; // Return the matched group or null if not found
    }





    useFocusEffect(
        useCallback(() => {
            async function getAndSetMealsEaten() {
                let macros = await AsyncStorage.getItem('@todayMacros');
                macros = JSON.parse(macros)
                let asyncMeals = macros ? Object.keys(macros?.foods) : []
                setMealsEaten(asyncMeals);
            }

            // Set cameraOpen to true whenever this screen is focused
            setOpen(true);
            setMealKey(mealKey)

            if (alertBadPhoto)
                createAlert()

            getAndSetMealsEaten();


        }, [mealKey, alertBadPhoto])
    );

    const handleSheetChanges = useCallback((i) => {
        if (i == -1) Keyboard.dismiss()
    })

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                setBounceValue(!bounceValue)

                const options = { quality: 0.5, base64: true };
                const data = await cameraRef.current.takePictureAsync(options);
                navigation.navigate("ShowPhoto", { imageData: data, textData: null, mealKey: currentMealKey, })

            } catch (error) {
                console.log(error);
            }
        }
    };

    const changeCameraType = () => {
        if (type === CameraType.front)
            setType(CameraType.back)
        else
            setType(CameraType.front)
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            navigation.navigate("ShowPhoto", { imageData: { "base64": result.assets[0].base64, "uri": result.assets[0].uri }, textData: null, mealKey: currentMealKey })
        }
    };

    const changeMeal = (meal) => {
        setMealKey(meal);
        console.log(meal);

        setShowMealList(false);

        offset.value = withSpring(0);
    };

    const offset = useSharedValue(0)

    const animatedCarat = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: offset.value + "deg" }]
        }
    })


    // Not sure if we want to show preview screen when just text is submitted. logic is in ShowPhoto if we choose to do so
    async function storeData(value, imageLink) {
        return new Promise(async (resolve) => {
            let savedData = await AsyncStorage.getItem('@todayMacros');
            var macros = savedData ? JSON.parse(savedData) : {}; // Parse the saved data, if it exists

            // Initialize macros properties if they don't exist
            if (!macros.foods) {
                console.log("null")
                macros.fruit = 0;
                macros.vegetables = 0;
                macros.grains = 0;
                macros.protein = 0;
                macros.dairy = 0;
                macros.kcal = 0;
                macros.numMeals = 0;
                macros.images = [];
                macros.GIs = [];
                macros.emojis = {};
                macros.foods = {};

            }

            // Assuming `value` is already an object with the correct structure
            macros.fruit += value?.fruit;
            macros.vegetables += value?.vegetables;
            macros.grains += value?.grains;
            macros.kcal += value?.kcal;
            macros.protein += value?.protein;
            macros.dairy += value?.dairy;
            macros.numMeals += 1;
            macros.images.push(imageLink)
            macros.GIs.push(value?.GIindex)
            value.image = imageLink
            value.protein = value?.protein;
            value.description = value?.food


            macros.foods[currentMealKey] = value
            macros.emojis[currentMealKey] = value.emoji

            console.log(currentMealKey)


            console.log(macros)
            // Save the updated macros back to AsyncStorage
            await AsyncStorage.setItem('@todayMacros', JSON.stringify(macros));

            // Save food to allFoods (for gallery view)
            let currentFoods = await AsyncStorage.getItem("@allFoods")
            let parsedFoods = currentFoods ? JSON.parse(currentFoods) : []
            parsedFoods.push(value)
            await AsyncStorage.setItem('@allFoods', JSON.stringify(parsedFoods));


            resolve(0)
        })

    }

    async function sendTextRequest(text) {
        const apiKey = "AIzaSyDk3LpUrSqXY_DJmpOtCZjEDzphzLaoK-Y";
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        setAwaitingResponse(true);

        const result = await model.generateContent([`Here is a description of food: ${text}.
            The description must describe a specific food or meal. If the description does not describe a food, is vague, or specifies nothing, return only the string "error" and NO JSON. 
            Examples of descriptions that do not describe a specific food or meal: nothing, something tasty, food, meal with food.
            Do not make up what food was eaten. For instance, if the text is "slice of something", do not attempt to make a specific food (ex. "slice of pizza")

            If the description does describe a specific food or meal, considering the size of the meal, estimate each of the following quantities: Calories, fruits (cups), vegetables (cups), grains (ounces), protein (ounces), dairy (cups), GI index. 
            Consult online sources and be realistic. Return your answer in only a JSON format like this: 

            {"food": food title in 7 words or less (capitalize each word),
            "emoji": ONE SINGLE food emoji that best represents the food,
            "kcal": amount of kilocalories,
            "fruit": amount of fruit in cups,
            "vegetables": amount of vegetables in cups,
            "grains": amount of grains in ounces,
            "protein": amount of protein in ounces,
            "dairy": amount of dairy in cups,
            "GIindex": estimated GI index of the food,}
            
            If the food has 0 of anything, return the string "error" and nothing else.
            `]);

        const response = await result.response;
        var text = response.text().toString();
        console.log(text)
        text = trimForJson(text);
        console.log(text)


        let parsedText = null
        try {
            parsedText = JSON.parse(text)
        } catch {
            console.log("result didn't parse")
        }

        // check if JSON is formatted correctly
        if (!isNaN(parsedText?.fruit)) {
            const now = new Date();
            AsyncStorage.setItem("@lastMealTime", now.toString());
            console.log(now + "hallo")
            storeData(parsedText, null).then(response => {
                console.log("hi")
                navigation.navigate("Feedback");

            })
        }
        else {
            // not food!
            setError("Please describe your food better!")
            setAwaitingResponse(false)
        }
    }

    if (!permission) {
        // Camera permissions are still loading
        return (
            <View style={styles.container}>
                <Text>Requesting permissions...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    if (cameraOpen && mealsEaten)
        return (
            <>
                {cameraOpen
                    ? <View key={"camera"} style={{ flex: 1, backgroundColor: "black" }}>
                        <View style={styles.container}>
                            <Camera style={styles.camera} type={type} ref={cameraRef} autoFocus={AutoFocus.off}>
                                {showMealList ?
                                    <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flex: 1, zIndex: 2, position: 'absolute', width: "100%", height: "100%" }}>
                                        <LinearGradient start={{ x: 1, y: 1 }} end={{ x: 0, y: 1 }} colors={["#rgba(0, 0, 0, 0.7)", "transparent"]} style={{ flex: 1, zIndex: 2, position: 'absolute', width: "100%", height: "100%" }} />
                                    </Animated.View>
                                    : null}
                            </Camera>
                            <View style={{ position: "absolute", flex: 1, height: "100%", width: "100%", zIndex: 100 }}>
                                <View>
                                    <Pressable onPress={() => {
                                        setOpen(false)
                                        navigation.navigate('Home')
                                    }} style={styles.backBtn}>
                                        <SweetSFSymbol name="arrow.uturn.backward" size={24} colors={["white"]} />
                                        {/* <Back size="36" color="#FFF" style={{ alignSelf: "center" }} /> */}
                                    </Pressable>
                                    <View style={styles.mealListContainer}>
                                        {showMealList
                                            ? <Pressable
                                                onPress={() => {
                                                    setShowMealList(false)
                                                    offset.value = withSpring(0)
                                                }
                                                }
                                                style={{ flex: 1, zIndex: 0, position: 'absolute', width: windowWidth, height: windowHeight }}
                                            />
                                            : null}

                                        <Pressable
                                            onPress={() => {
                                                if (showMealList)
                                                    offset.value = withSpring(0)
                                                else
                                                    offset.value = withSpring(180)

                                                setShowMealList(!showMealList);
                                            }}
                                            style={{ ...styles.mealTextContainer }}>
                                            {({ pressed }) => (
                                                <>
                                                    <Text style={[{ backgroundColor: pressed ? null : null }, styles.chosenMealText]}>{currentMealKey.charAt(0).toUpperCase() + currentMealKey.slice(1)}</Text>
                                                    {mealsEaten.length !== meals.length - 1
                                                        ? <Animated.View style={animatedCarat}>
                                                            {/* <ArrowDown2 size={32} color="#FFF" /> */}
                                                            <SweetSFSymbol name="chevron.down" size={32} colors={["white"]} />
                                                        </Animated.View>
                                                        : null
                                                    }
                                                </>
                                            )}

                                        </Pressable>

                                        {showMealList
                                            ? <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={{ alignItems: "flex-end" }}>
                                                {currentMealKey === 'breakfast' || mealsEaten.includes('breakfast')
                                                    ? null
                                                    : <Pressable onPress={() => changeMeal('breakfast')} style={styles.mealTextContainer}>
                                                        {({ pressed }) => (
                                                            <>
                                                                <Text style={pressed ? styles.chosenMealText : styles.optionMealText}>Breakfast</Text>
                                                                {/* <Coffee size={32} color="#FFF" /> */}
                                                                <SweetSFSymbol name="mug" size={32} colors={["white"]} />
                                                            </>
                                                        )}
                                                    </Pressable>
                                                }
                                                {currentMealKey === 'lunch' || mealsEaten.includes('lunch')
                                                    ? null
                                                    : <Pressable onPress={() => changeMeal('lunch')} style={styles.mealTextContainer}>
                                                        {({ pressed }) => (
                                                            <>
                                                                <Text style={pressed ? styles.chosenMealText : styles.optionMealText}>Lunch</Text>
                                                                {/* <Sun1 size={32} color="#FFF" /> */}
                                                                <SweetSFSymbol name="sun.max" size={32} colors={["white"]} />
                                                            </>
                                                        )}
                                                    </Pressable>
                                                }
                                                {currentMealKey === 'dinner' || mealsEaten.includes('dinner')
                                                    ? null
                                                    : <Pressable onPress={() => changeMeal('dinner')} style={styles.mealTextContainer}>
                                                        {({ pressed }) => (
                                                            <>
                                                                <Text style={pressed ? styles.chosenMealText : styles.optionMealText}>Dinner</Text>
                                                                {/* <Moon size={32} color="#FFF" /> */}
                                                                <SweetSFSymbol name="moon" size={32} colors={["white"]} />
                                                            </>
                                                        )}
                                                    </Pressable>
                                                }
                                                {/* {mealKey === 'snack'
                                                    ? null
                                                    : <Pressable onPress={() => changeMeal('snack')} style={styles.mealTextContainer}>
                                                        {({ pressed }) => (
                                                            <>
                                                                <Text style={pressed ? styles.chosenMealText : styles.optionMealText}>Snack</Text>
                                                                <Grammerly size={32} color="#FFF" />
                                                            </>
                                                        )}
                                                    </Pressable>
                                                } */}
                                            </Animated.View>
                                            : null

                                        }
                                    </View>
                                </View>
                                <View style={styles.buttonContainer}>
                                    <Pressable onPress={openTextSheet} style={styles.actionBtn}>
                                        <SweetSFSymbol name="character.textbox" size={24} colors={["white"]} />
                                        {/* <TextIcon size="24" color="#fff" style={{ alignSelf: "center", }} /> */}
                                    </Pressable>
                                    <Pressable onPress={takePicture} style={styles.pictureBtn}>
                                        <SweetSFSymbol name="camera.aperture" size={48} colors={["black"]} symbolEffect={{
                                            type: "bounce",
                                            value: bounceValue,
                                            direction: "down",
                                        }} />
                                        {/* <Lifebuoy size="48" color="#000" style={{ alignSelf: "center" }} /> */}
                                    </Pressable>
                                    <Pressable onPress={pickImage} style={styles.actionBtn}>
                                        <SweetSFSymbol name="photo.on.rectangle.angled" size={24} colors={["white"]} />
                                        {/* <GalleryAdd size="24" color="#FFF" style={{ alignSelf: "center", }} /> */}
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                        <BottomSheet
                            ref={bottomSheetRef}
                            snapPoints={['75%', '95%']}
                            enablePanDownToClose={true}
                            backgroundStyle={styles.bottomSheetBg}
                            index={-1}
                            onChange={handleSheetChanges}
                        >
                            <BottomSheetView style={{ flex: 1 }}>
                                <Pressable onPress={() => Keyboard.dismiss()} style={styles.bottomSheetContent}>
                                    <Text style={styles.bigText}>No photo? No problem!</Text>
                                    <TextInput
                                        style={{ ...styles.textField, borderColor: error ? "#D41111" : "#130630", }}
                                        placeholder='Type your meal...'
                                        multiline={true}
                                        onSubmitEditing={() => console.log(text)}
                                        enterKeyHint='done'
                                        maxLength={100}
                                        blurOnSubmit={true}
                                        onChangeText={setText}
                                        value={text}
                                    />
                                    <Text style={styles.error}>{error}</Text>
                                    <Pressable
                                        onPress={() => { if (!awaitingResponse) sendTextRequest(text) }}
                                        style={styles.submitTextBtn}
                                    >
                                        {!awaitingResponse
                                            ? <Text style={styles.submitText}>Submit!</Text>
                                            : <ActivityIndicator />
                                        }

                                    </Pressable>
                                </Pressable>
                            </BottomSheetView>
                        </BottomSheet>
                    </View>
                    : null}

            </>
        )
}


const styles = StyleSheet.create({
    topContainer: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: 'space-around',
        marginTop: 55

    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        overflow: 'hidden',
    },
    segmentedControl: {
        // flex: 1,
        width: "65%",
        height: 45,
    },
    camera: {
        flex: 1,
        width: '100%',
        zIndex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: "center",
        position: "absolute",
        top: windowHeight * 0.8,
        width: "100%",
    },
    button: {
        padding: 10,
        backgroundColor: '#000000a0',
        borderRadius: 5,
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
    pictureBtn: {
        backgroundColor: "#FFCC26",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FFDE70",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 2,
        padding: 10,
        width: 140
    },
    backBtn: {
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        position: "absolute",
        top: 60,
        left: 20,
        zIndex: 10
        // borderColor: "rgba(255, 255, 255, 0.15)",
        // borderWidth: 1
    },
    actionBtn: {
        backgroundColor: "rgba(255, 252, 242, 0.4)",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
        width: 50,
        height: 50,
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1
    },
    bottomButtons: {
        flexDirection: "row",
        gap: 20,
        alignItems: "center",
        justifyContent: "space-evenly",
        marginTop: 20,
        width: "90%",
        alignSelf: "center"
    },
    bottomSheetBg: {
        backgroundColor: 'rgba(255, 204, 38, 1)',
    },
    bottomSheetContent: {
        margin: 24,
        alignItems: "center",
        gap: 20,
    },
    bigText: {
        fontSize: 25,
        fontFamily: "SpaceGrotesk-Bold",
        textAlign: "center",
    },
    textField: {
        width: "95%",
        fontFamily: "SpaceGrotesk-Regular",
        fontSize: 18,
        borderWidth: 2,
        borderRadius: 25,
        padding: 10,
        height: windowHeight * 0.15,
        textAlignVertical: "top"

    },
    submitTextBtn: {
        backgroundColor: "#130630",
        borderRadius: 5,
        width: 120,
        height: 50,
        justifyContent: "center",
        alignItems: "center"

    },
    submitText: {
        fontFamily: "SpaceGrotesk-Regular",
        fontSize: 20,
        color: "#FFCC26"
    },
    topButtons: {
        paddingLeft: 20,
        paddingRight: 20,
        position: "absolute",
        top: windowHeight * 0.07,
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",

    },
    mealTextContainer: {
        flexDirection: "row",
        gap: 10,
        zIndex: 100,
        right: 20,
        top: 53,
        paddingTop: 7,
        paddingBottom: 8
    },
    chosenMealText: {
        color: "#FFF",
        fontSize: 25,
        fontFamily: "SpaceGrotesk-Bold",
    },
    optionMealText: {
        color: "#FFF",
        fontSize: 25,
        fontFamily: "SpaceGrotesk-Regular",
    },
    mealListContainer: {
        alignItems: "flex-end",
    },
    error: {
        color: "#D41111",
        fontSize: 15,
        fontFamily: "SpaceGrotesk-Regular",
    },
});
