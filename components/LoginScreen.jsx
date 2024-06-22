import React, { useState, useEffect } from 'react';
// import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable } from 'react-native';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setPersistence, browserSessionPersistence, getReactNativePersistence } from "firebase/auth";

import { useFonts } from "expo-font";
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, SafeAreaView, } from 'react-native';


import happylunchguy from "../assets/mascots/yellowGuy.png"
import onboardingguy from "../assets/mascots/onboardingguy.png"
import { Apple, Google } from 'iconsax-react-native';

const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height

export default function LoginScreen({ navigation, route }) {

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState("login");
    const [loggedIn, setLoggedIn] = useState(false);
    const [error, setError] = useState(null);
    const auth = FIREBASE_AUTH;


    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            setLoggedIn(true);
            await AsyncStorage.setItem('@loggedIn', "true");
            await AsyncStorage.setItem("@uid", auth.currentUser.uid);
            const localPersistence = getReactNativePersistence(AsyncStorage)
            setPersistence(auth, localPersistence).then(() => {
                // Your code to handle user authentication
            }).catch((error) => {
                console.error("Error setting persistence:", error);
            });
        } catch (error) {
            setLoggedIn(false);
            console.log(error);
            await AsyncStorage.setItem('@loggedIn', "false");
        } finally {
            setLoading(false);
        }
    }

    async function register() {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            setLoggedIn(true);
            await AsyncStorage.setItem('@loggedIn', "true");
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFBEE", }}>
            <View style={styles.container}>
                <Text style={styles.title}>Login</Text>

                <View style={styles.inputContainer}>
                    <View style={{flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: "rgba(60, 60, 67, 0.4)"}}>
                        <View style={{alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white",}}>
                            <Text style={styles.inputLabel}>Email</Text>
                        </View>
                        <TextInput value={email} style={styles.input} placeholder='email@example.com' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <View style={{alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white",}}>
                            <Text style={styles.inputLabel}>Password</Text>
                        </View>
                        <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                    </View>
                </View>
                <Text style={styles.error}>{error}</Text> 
                <Pressable onPress={ async () => {
                    signIn();
                    await AsyncStorage.setItem("@onboardingDone", "true")
                }}
                style={styles.infoButton}>
                    <Text style={styles.infoButtonText}>Let's go!</Text>
                </Pressable>

                <Text style={styles.infoText}>Or continue with</Text>
                <View style={styles.iconButtonContainer}>
                <Pressable style={styles.iconButton}>
                    <Apple size={32} color="black" variant="Bold" />
                </Pressable>
                <Pressable style={styles.iconButton}>
                    <Google size={32} color="black" variant="Bold"  />
                </Pressable>
                </View>
            </View>
        </SafeAreaView>

        // <SafeAreaView>
        //     <View style={styles.container}>
        //         <Text style={styles.title}>{action === "login" ? "Login" : "Register"}</Text>
        //         <TextInput value={email} style={styles.input} placeholder='email' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
        //         <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
        //         {action === "login"
        //             ? <Button title="Don't have an account? Register here" onPress={() => { setAction("register") }} />
        //             : <Button title="Already have an account? Login here" onPress={() => { setAction("login") }} />
        //         }
        //         {loading
        //             ? <Text>Loading...</Text>
        //             : <Pressable title='login' style={styles.loginBtn} onPress={ async () => {
        //                 await AsyncStorage.setItem("@onboardingDone", "true")
        //                 console.log(auth)
        //                 console.log(email)
        //                 console.log(password)
        //                 if (action === "login") {
        //                     signIn();
        //                 } else {
        //                     register();
        //                 }
        //             }}>
        //                 {action === "login"
        //                     ? <Text>Login</Text>
        //                     : <Text>Register</Text>
        //                 }
        //             </Pressable>
        //         }
        //         {loggedIn
        //             ? <Text>Logged In</Text>
        //             : <Text>Invalid Credentials</Text>
        //         }
        //     </View>
        // </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 50,
        flex: 1,
        alignItems: "center"
    },

    background: {
        padding: 50,
    },
    title: {
        fontSize: 50,
        alignSelf: "center",
        fontFamily: "SF-Rounded",
        position: "absolute",
        top: screenHeight * 0.05
    },
    inputContainer: {
        borderRadius: 20, 
        overflow: "hidden", 
        borderWidth: 1, 
        borderColor: "rgba(60, 60, 67, 0.4)", 
        position: "absolute",
        top: screenHeight * 0.15, 
        width: "100%",
    },
    input: {
        fontSize: 15,
        flex: 1,
        backgroundColor: "white",
        height: 50,
        fontFamily: "SF-Pro",
    },
    inputLabel: {
        fontFamily: "SF-Pro",
        width: screenWidth * 0.23,
        paddingLeft: 15
    },
    infoTitle: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 50,
        position: "absolute",

    },
    infoText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
        position: "absolute",
        top: screenHeight * 0.45
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
        top: screenHeight * 0.3,
        position: "absolute",
        
    },
    infoButtonText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
    },
    iconButtonContainer: {
        top: screenHeight * 0.5,
        position: "absolute",
        flexDirection: "row",
        gap: 20
    },
    iconButton: {
        padding: 10,
        borderRadius: 15,
        borderWidth: 1
    }

});




