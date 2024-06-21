import React, { useState, useEffect } from 'react';
import { useFonts } from "expo-font";
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, } from 'react-native';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import happylunchguy from "../assets/mascots/yellowGuy.png"
import onboardingguy from "../assets/mascots/onboardingguy.png"

const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height

export default function LoginScreen({ navigation, onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState("login");
    const [loggedIn, setLoggedIn] = useState(false);

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            setLoggedIn(true);
            onLogin();
            await AsyncStorage.setItem('@loggedIn', "true");
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
            onLogin();
            await AsyncStorage.setItem('@loggedIn', "true");
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <View style={styles.background}>
            <Text style={styles.title}>{action === "login" ? "Login" : "Register"}</Text>
            <TextInput value={email} style={styles.input} placeholder='email' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
            <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
            {action === "login"
                ? <Button title="Don't have an account? Register here" onPress={() => {setAction("register") }} />
                : <Button title="Already have an account? Login here" onPress={() => {setAction("login") }} />
            }
            {loading
                ? <Text>Loading...</Text>
                : <Pressable title='login' style={styles.loginBtn} onPress={() => {
                    console.log(auth)
                    console.log(email)
                    console.log(password)
                    if (action === "login") {
                        signIn();
                    } else {
                        register();
                    }
                }}>
                    {action === "login"
                        ? <Text>Login</Text>
                        : <Text>Register</Text>
                    }
                </Pressable>
            }
            {loggedIn 
                ? <Text>Logged In</Text> 
                : <Text>Invalid Credentials</Text>
            }
        </View>
    );
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
        fontSize: 50,
        position: "absolute",

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
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 2,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        position: "absolute",
        top: screenHeight * 0.35
    },
    infoButtonText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
    },
    infoButtonTextSmall: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 22,
        textDecorationLine: "underline"
    }
});




