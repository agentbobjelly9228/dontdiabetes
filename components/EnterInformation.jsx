import React, { useState, useEffect, useRef } from 'react';
import { useFonts } from "expo-font";
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, } from 'react-native';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import happylunchguy from "../assets/mascots/yellowGuy.png"
import onboardingguy from "../assets/mascots/onboardingguy.png"
import thoughtguy from "../assets/mascots/thoughtguy.png"
import bighappyguy from "../assets/mascots/bighappyguy.png"

import { AddCircle, ArrowLeft2, MinusCirlce } from 'iconsax-react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height


export default function EnterInformation({ navigation }) {

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    const [name, setName] = useState('');
    const [age, setAge] = useState(20);
    const [weight, setWeight] = useState(150);
    const [exercise, setExercise] = useState(3);
    const [height, setHeight] = useState(68);

    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);


    const ref = useRef();

    const data = [
        {
            id: "1",
            question: "What's your name?",
            type: "alphabet",
            placeholder: "Name",
            value: name,
            onChange: setName
        },
        {
            id: "2",
            question: "How old are you?",
            type: "numeric",
            units: "years old",
            placeholder: "20",
            increment: "1",
            value: age,
            onChange: setAge,
            max: 999,
        },
        {
            id: "3",
            question: "About how much do you weigh?",
            type: "numeric",
            units: "pounds",
            placeholder: "150",
            increment: "10",
            value: weight,
            onChange: setWeight,
            max: 999,
        },
        {
            id: "4",
            question: "How tall are you?",
            type: "numeric",
            units: "inches",
            placeholder: "68",
            increment: "10",
            value: height,
            onChange: setHeight,
            max: 999,
        },
        {
            id: "5",
            question: "How often do you exercise?",
            type: "numeric",
            units: "days a week",
            placeholder: "#",
            increment: "1",
            value: exercise,
            onChange: setExercise,
            max: 7
        },
        {
            id: "6",
            title: "Fabulous!",
            text: "We've saved all of your answers. Now before you head along, make an account to sync Big Guy on all your other devices."
        },
    ];


    const offset = useSharedValue(0)

    const animatedBigGuy = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: offset.value + "deg" }],
            position: "absolute",
            top: screenHeight * -0.1,
            alignSelf: "center",

        }
    })

    if (!fontsLoaded) {
        return null;
    }

    const updateCurrentSlideIndex = e => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentSlideIndex(currentIndex)
    }

    const goNextSlide = () => {
        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex != data.length) {
            const offset = nextSlideIndex * screenWidth;
            ref?.current?.scrollToOffset({ offset });
            setCurrentSlideIndex(nextSlideIndex);
        }
    }

    const goBackSlide = () => {
        const backSlideIndex = currentSlideIndex - 1;
        if (backSlideIndex >= 0) {
            const offset = backSlideIndex * screenWidth;
            ref?.current?.scrollToOffset({ offset });
            setCurrentSlideIndex(backSlideIndex);
        }
    }

    const storeAnswers = async () => {
        await AsyncStorage.setItem("@name", name);
        await AsyncStorage.setItem("@age", JSON.stringify(age));
        await AsyncStorage.setItem("@weight", JSON.stringify(weight));
        await AsyncStorage.setItem("@exercise", JSON.stringify(exercise));
        await AsyncStorage.setItem("@height", JSON.stringify(height));

        console.log("answers stored")
        goNextSlide();
        offset.value = withTiming(offset.value + 360, { duration: 1500 });


    }


    const indexToValue = {
        0: name,
        1: age,
        2: weight,
        3: height,
        4: exercise,
    }

    return (
        <View style={{ backgroundColor: "#FFFBEE", flex: 1, }}>
            <Pressable onPress={() => { navigation.goBack() }} style={{ position: "absolute", left: 20, top: 60, zIndex: 100 }}>
                <ArrowLeft2 color="#000" size={32} />
            </Pressable>
            <Animated.View style={animatedBigGuy}>
                <Image source={thoughtguy} style={{ height: screenHeight * 0.7 }} />
            </Animated.View>

            <FlatList
                scrollEnabled={false}
                ref={ref}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                data={data}
                horizontal
                renderItem={({ item }) => <Item question={item.question} type={item.type} units={item.units} placeholder={item.placeholder} increment={item.increment} value={item.value} onChange={item.onChange} max={item.max} title={item.title} text={item.text} />}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ position: "absolute", zIndex: 100, top: screenHeight * 0.45 }}
                keyExtractor={(item) => item.id}
            />
            <View style={{ zIndex: 100, justifyContent: "space-evenly", gap: 50, alignItems: "center", flexDirection: "row", position: "absolute", top: screenHeight * 0.8, alignSelf: "center", flex: 1, }}>
                {currentSlideIndex === data.length - 1
                    ? <Pressable onPress={() => navigation.navigate("SignUpScreen")} style={styles.infoButton}>
                        <Text style={styles.infoButtonText}>Let's go!</Text>
                    </Pressable>
                    : <>
                        {currentSlideIndex != 0
                            ? <Pressable onPress={goBackSlide}>
                                <ArrowLeft2 style={styles.backButton} size={28} color="black" />
                            </Pressable>
                            : null
                        }

                        {
                            indexToValue[currentSlideIndex]
                                ? <Pressable
                                    onPress={currentSlideIndex === data.length - 2 ? storeAnswers : goNextSlide}
                                    style={styles.infoButton}>
                                    <Text style={styles.infoButtonText}>{currentSlideIndex === data.length - 2 ? "Done!" : "Next"}</Text>
                                </Pressable>
                                : <Pressable style={styles.infoButtonDisabled}>
                                    <Text style={styles.infoButtonDisabledText}>{currentSlideIndex === data.length - 2 ? "Done!" : "Next"}</Text>
                                </Pressable>

                        }

                        {currentSlideIndex != 0
                            ? <Pressable>
                                <ArrowLeft2 style={{ ...styles.backButton, opacity: 0 }} size={28} color="black" />
                            </Pressable>
                            : null
                        }
                    </>
                }

            </View>
        </View>
    );
}

function NumberInput({ placeholder, increment, value, onChange, max }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-evenly" }}>
            <Pressable onPress={() => { if (value > 0) onChange(value - increment) }}>
                <MinusCirlce size={32} color="black" variant="Bold" />
            </Pressable>
            <TextInput
                value={String(value)}
                onChangeText={(text) => {
                    onChange(text)
                }}
                onEndEditing={() => {
                    console.log(value)
                    let number = parseInt(value) || 0
                    if (number < 0)
                        onChange(0)
                    else if (number > max)
                        onChange(max)
                    else
                        onChange(number)
                }}
                textAlign='center'
                keyboardType="number-pad"
                placeholderTextColor={"#ffe07c"}
                style={styles.numberInput} />
            <Pressable onPress={() => { if (value < max) onChange(value + increment) }}>
                <AddCircle size={32} color="black" variant="Bold" />
            </Pressable>
        </View>
    );
}

function Item({ question, type, placeholder, units, increment, value, onChange, max, title, text }) {
    if (question)
        return (
            <View style={{ width: screenWidth, height: screenWidth, alignItems: "center", }}>
                <View>
                    <Text style={styles.infoTitle}>{question}</Text>
                    {type === "alphabet"
                        ? <TextInput value={value} onChangeText={onChange} textAlign='center' placeholder={placeholder} placeholderTextColor={"#ffe07c"} style={styles.textInput} />
                        : <NumberInput value={value} increment={parseInt(increment)} onChange={onChange} placeholder={placeholder} max={max} />
                    }
                    {units
                        ? <Text style={styles.infoTextYellow}>{units}</Text>
                        : null
                    }
                </View>
            </View>
        );

    return (
        <View style={{ width: screenWidth, height: screenWidth, alignItems: "center", }}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.infoText}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    background: {
        padding: 50,
    },
    title: {
        fontSize: 50,
        alignSelf: "center"
    },
    input: {
        fontSize: 20,
        borderColor: "gray",
        borderWidth: 1,
        alignSelf: "center",
        width: 150,
        opacity: 0.5,
        borderRadius: 10,
        paddingLeft: 10,
        margin: 10
    },
    loginBtn: {
        backgroundColor: "green",
        borderWidth: 1,
        borderColor: "green",
        width: 100,
        height: 30,
        borderRadius: 20,
        alignSelf: "center",
        alignItems: "center"
    },
    infoTitle: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 40,
    },
    infoText: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 22,
        paddingTop: 15,
        width: "90%",
    },
    infoTextYellow: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
        paddingTop: 15,
        color: "#FFCC26",
    },
    infoButton: {
        backgroundColor: "#FFCC26",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FFDE70",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignSelf: "center",
        zIndex: 100,
    },
    infoButtonText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
    },
    infoButtonDisabled: {
        backgroundColor: "#FFCC26",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FFDE70",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignSelf: "center",
        zIndex: 100,
    },
    infoButtonDisabledText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
        color: "rgba(0, 0, 0, 0.4)"
    },
    infoButtonTextSmall: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 22,
        textDecorationLine: "underline",
    },
    textInput: {
        borderBottomWidth: 2,
        fontFamily: "SF-Rounded",
        fontSize: 40,
        color: "#FFCC26",
        borderColor: "#FFCC26",
        fontWeight: "bold",
        height: 60
    },
    numberInput: {
        fontFamily: "SF-Rounded",
        fontSize: 80,
        color: "#FFCC26",
        borderColor: "#FFCC26",
        fontWeight: "bold",
        width: screenWidth * 0.4,
        borderBottomWidth: 2,
        borderColor: "#FFCC26",
    },
    backButton: {

    },
});




// export default function LoginScreen({ navigation, onLogin }) {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [action, setAction] = useState("login");
//     const [loggedIn, setLoggedIn] = useState(false);

//     const signIn = async () => {
//         setLoading(true);
//         try {
//             const response = await signInWithEmailAndPassword(auth, email, password);
//             setLoggedIn(true);
//             onLogin();
//             await AsyncStorage.setItem('@loggedIn', "true");
//         } catch (error) {
//             setLoggedIn(false);
//             console.log(error);
//             await AsyncStorage.setItem('@loggedIn', "false");
//         } finally {
//             setLoading(false);
//         }
//     }

//     async function register() {
//         setLoading(true);
//         try {
//             const response = await createUserWithEmailAndPassword(auth, email, password);
//             console.log(response);
//             setLoggedIn(true);
//             onLogin();
//             await AsyncStorage.setItem('@loggedIn', "true");
//         } catch (error) {
//             console.log(error)
//         }
//     }
//     return (
//         <View style={styles.background}>
//             <Text style={styles.title}>{action === "login" ? "Login" : "Register"}</Text>
//             <TextInput value={email} style={styles.input} placeholder='email' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
//             <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
//             {action === "login"
//                 ? <Button title="Don't have an account? Register here" onPress={() => {setAction("register") }} />
//                 : <Button title="Already have an account? Login here" onPress={() => {setAction("login") }} />
//             }
//             {loading
//                 ? <Text>Loading...</Text>
//                 : <Pressable title='login' style={styles.loginBtn} onPress={() => {
//                     console.log(auth)
//                     console.log(email)
//                     console.log(password)
//                     if (action === "login") {
//                         signIn();
//                     } else {
//                         register();
//                     }
//                 }}>
//                     {action === "login"
//                         ? <Text>Login</Text>
//                         : <Text>Register</Text>
//                     }
//                 </Pressable>
//             }
//             {loggedIn 
//                 ? <Text>Logged In</Text> 
//                 : <Text>Invalid Credentials</Text>
//             }
//         </View>
//     );
// }
