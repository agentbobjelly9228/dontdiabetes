import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable } from 'react-native';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setPersistence, browserSessionPersistence, getReactNativePersistence } from "firebase/auth";


export default function LoginScreen({ navigation, onLogin }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState("login");
    const auth = FIREBASE_AUTH;
    const [loggedIn, setLoggedIn] = useState(false);


    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
            setLoggedIn(true);
            onLogin();
            // import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
            // import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
            // const auth = initializeAuth(app, {
            //     persistence: getReactNativePersistence(ReactNativeAsyncStorage)
            // });
            await AsyncStorage.setItem('@loggedIn', "true");
            await AsyncStorage.setItem("@uid", auth.currentUser.uid);
            const localPersistence = getReactNativePersistence(AsyncStorage)
            setPersistence(auth, localPersistence).then(() => {
                // Your code to handle user authentication
            }).catch((error) => {
                console.error("Error setting persistence:", error);
            });
        } catch (error) {
            console.log("sup")
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
    return <View style={styles.background}>
        <Text style={styles.title}>{action === "login" ? "Login" : "Register"}</Text>
        <TextInput value={email} style={styles.input} placeholder='email' onChangeText={(text) => setEmail(text)} autoCapitalize='none'></TextInput>
        <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none'></TextInput>
        {action === "login" ? <Button title="Don't have an account? Register here" onPress={() => {
            setAction("register")
        }}></Button> :
            <Button title="Already have an account? Login here" onPress={() => {
                setAction("login")
            }}></Button>}
        {loading ? <Text>Loading...</Text> :

            <Pressable title='login' style={styles.loginBtn} onPress={() => {
                console.log(auth)
                console.log(email)
                console.log(password)
                if (action === "login") {
                    signIn();
                } else {
                    register();
                }

            }}>
                {action === "login" ? <Text>Login</Text> :
                    <Text>Register</Text>}

            </Pressable>
        }
        {
            loggedIn ? <Text>Logged In</Text> :
                <Text>Invalid Credentials</Text>
        }
    </View>
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
    }
});