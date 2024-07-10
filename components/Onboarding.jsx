import React, { useState, useEffect, useRef } from 'react';
import { useFonts } from "expo-font";
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, } from 'react-native';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import happylunchguy from "../assets/mascots/yellowGuy.png"
import onboardingguy from "../assets/mascots/onboardingguy.png"
import smallguy from "../assets/mascots/smallGuy.png"
import { Camera, Clipboard, Code, Flag, MenuBoard, Moon, Tether } from 'iconsax-react-native';
import SweetSFSymbol from "sweet-sfsymbols";


const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height

data = [
    {
        index: 0,
        title: "Welcome!\nThis is Big Guy.",
        image: smallguy,
        text: "He's been waiting for you to join him on a neat, new, nutrition journey.",
    },
    {
        index: 1,
        title: "Here's what you do:",
        text: "With Nutrivision, you just have to snap a photo of your food whenever you eat something. That's it! No calorie tracking, no barcode scanning, no stress."
    },
    {
        index: 2,
        title: "Here's what you get:",
        text: "In return, we'll give you daily, actionable advice each evening that will help you eat happier and healthier. We will never tell you to restrict, diet, or push."
    },
    {
        index: 3,
        title: "Please note:",
        text: "This application is in an early release phase, and the information provided is for informational purposes only, not as medical advice. Always consult your physician with any health concerns or questions. Feel free to submit any feedback!"
    },

]



export default function Onboarding({ navigation }) {

    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const ref = useRef();

    const updateCurrentSlideIndex = e => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentSlideIndex(currentIndex)
    }

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

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

    return (
        <View style={{ backgroundColor: "#FFFBEE", flex: 1, }}>
            <Image source={onboardingguy} style={{ alignSelf: "center", height: screenHeight * 0.7, resizeMode: "contain", position: "absolute", top: screenHeight * -0.1, }} />
            {/* <Text style={styles.infoTitle}>All about Nutrivision</Text> */}
            <FlatList
                data={data}
                ref={ref}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                horizontal
                renderItem={({ item }) => <Item index={item.index} text={item.text} title={item.title} image={item.image} navigation={navigation} />}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.index}
                style={{ position: "absolute", zIndex: 100, top: screenHeight * 0.35 }}
            // initialScrollIndex={-1}

            />
            <View style={{ position: "absolute", top: screenHeight * 0.8, justifyContent: "center", alignSelf: "center", gap: 20 }}>
                <DotProgress currentSlideIndex={currentSlideIndex} />
                <Pressable onPress={() => navigation.navigate("EnterInformation")} style={styles.infoButton}><Text style={styles.infoButtonText}>Let's Begin!</Text></Pressable>
                <Pressable onPress={() => { navigation.navigate("LoginScreen") }}>
                    <Text style={styles.infoButtonTextSmall}>Already have an account? Log In</Text>
                </Pressable>
            </View>

        </View>
    );
}


function Item({ index, text, title, image, navigation }) {
    return (
        <View style={{ width: screenWidth, height: screenWidth, alignItems: "center", }}>
            <View style={{ ...styles.infoCard }}>
                <View style={{ gap: 20, justifyContent: "center", alignItems: "center" }}>
                    <Text style={styles.title}>{title}</Text>
                    {index === 0 &&
                        <>
                            {image && <Image source={smallguy} />}
                            <Text style={{ ...styles.cardText }}>{text}</Text>
                        </>
                    }
                    {index === 1 &&
                        <View style={{ justifyContent: "center", alignItems: "center", }}>
                            <View style={{ gap: 15 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 25 }}>
                                    {/* <MenuBoard size={48} variant="Bold" color="#FFCC26" /> */}
                                    <SweetSFSymbol name="fork.knife" size={40} colors={["#FFCC26"]} />
                                    <Text style={styles.listText}>Eat food.</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 25 }}>
                                    {/* <Camera size={48} variant="Bold" color="#FFCC26" /> */}
                                    <SweetSFSymbol name="camera.fill" size={40} colors={["#FFCC26"]} />
                                    <Text style={styles.listText}>Scan it.</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 25 }}>
                                    {/* <Flag size={48} variant="Bold" color="#FFCC26" /> */}
                                    <SweetSFSymbol name="flag.fill" size={40} colors={["#FFCC26"]} />
                                    <Text style={styles.listText}>That's it!</Text>
                                </View>
                            </View>
                            <Text style={{ ...styles.cardText, fontStyle: "italic" }}>No calorie counting, no stress.</Text>
                        </View>
                    }
                    {index === 2 &&
                        <View style={{ justifyContent: "center", alignItems: "center", }}>
                            <View style={{ gap: 15 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 25 }}>
                                    {/* <Clipboard size={48} variant="Bold" color="#ffcc32" /> */}
                                    <SweetSFSymbol name="sparkles" size={40} colors={["#FFCC26"]} />
                                    <Text style={styles.listText}>Daily insights.</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 25 }}>
                                    {/* <Moon size={48} variant="Bold" color="#ffcc32" /> */}
                                    <SweetSFSymbol name="moon.fill" size={40} colors={["#FFCC26"]} />
                                    <Text style={styles.listText}>Nightly recaps.</Text>
                                </View>
                            </View>
                            <Text style={{ ...styles.cardText, fontStyle: "italic" }}>We will never tell you to diet or push.</Text>
                        </View>
                    }
                    {index === 3 &&
                        <>
                            {/* <Code size={48} variant="Bold" color="#ffcc32" /> */}
                            <SweetSFSymbol name="exclamationmark.circle.fill" size={40} colors={["#FFCC26"]} />
                            <Text style={{ ...styles.cardText }}>{text}</Text>
                        </>
                    }
                </View>
            </View>
        </View>
    )
}



function DotProgress({ currentSlideIndex }) {
    // let arr = new Array(data.length).fill()
    // let answer = arr.map((_, index) => {return index})
    // console.log(answer)

    console.log(currentSlideIndex)
    return (
        <View style={{ gap: 10, flexDirection: "row", alignSelf: "center", paddingBottom: 15 }}>
            {
                new Array(data.length).fill().map((_, i) => {
                    if (i == currentSlideIndex)
                        return <View style={styles.selectedDot} key={i} />
                    else
                        return <View style={styles.unselectedDot} key={i} />
                })
            }

        </View>
    );
}

const styles = StyleSheet.create({
    unselectedDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: "black",
        opacity: 0.3
    },
    selectedDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: "black",
    },
    background: {
        padding: 50,
    },
    title: {
        fontSize: 30,
        alignSelf: "center",
        fontFamily: "SF-Compact",
        textAlign: "center"

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
    infoTitle: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 35,
        position: "absolute",
        top: screenHeight * 0.32,
        textAlign: "center",
        alignSelf: "center"

    },
    infoText: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 22,
        padding: 50,
        position: "absolute",
        top: screenHeight * 0.05
    },
    infoButton: {
        backgroundColor: "#FFCC26",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FFDE70",
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 2,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
    },
    infoButtonText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
    },
    infoButtonTextSmall: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 20,
        textDecorationLine: "underline",
    },
    infoCard: {
        height: screenHeight * 0.4,
        width: screenHeight * 0.4,
        backgroundColor: "white",
        shadowColor: "#000000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        top: 20,
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    cardText: {
        // fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 20,
        paddingTop: 15,
        // fontStyle: "italic"
    },
    listText: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 20,
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
