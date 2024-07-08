import React, { useState, useEffect } from 'react';
// import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable } from 'react-native';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCredential, OAuthProvider } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setPersistence, browserSessionPersistence, getReactNativePersistence } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { useFonts } from "expo-font";
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, SafeAreaView, } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import happylunchguy from "../assets/mascots/yellowGuy.png"
import onboardingguy from "../assets/mascots/onboardingguy.png"
import { Apple, ArrowLeft2, Google } from 'iconsax-react-native';

const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height

const errors = {
    "auth/invalid-email": "Please enter a valid email.",
    "auth/email-already-in-use": "This email is already associated with an account.",
    "auth/weak-password": "Please ensure your password includes at least 6 characters.",
    "auth/user-not-found": "Your email or password is incorrect.",
    "auth/wrong-password": "Your email or password is incorrect.",
    "auth/invalid-credential": "Your email or password is incorrect."
}

export default function LoginScreen({ navigation, route }) {
    async function checkPlayServices() {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            console.log('Google Play Services are available');
        } catch (error) {
            console.error('Play Services error:', error);
        }
    }
    async function signInWithGoogle() {
        try {
            checkPlayServices()
            const userInfo = await GoogleSignin.signIn();
            console.log(userInfo.idToken)
            const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);

            // Sign-in the user with the credential
            return signInWithCredential(auth, googleCredential);
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play Services not available or outdated');
            } else {
                console.error('Error signing in:', error);
            }
        }
    }

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null)

    const auth = FIREBASE_AUTH;


    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            const localPersistence = getReactNativePersistence(AsyncStorage)
            setPersistence(auth, localPersistence).then(() => {
                // Your code to handle user authentication
            }).catch((error) => {
                console.error("Error setting persistence:", error);
            });
        } catch (error) {
            setError(errors[error.code] ? errors[error.code] : "Something went wrong!");
        } finally {
            setLoading(false);
        }
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFBEE", }}>
            <View style={styles.container}>
                <Pressable onPress={() => { navigation.navigate("Onboarding") }} style={{ position: "absolute", left: 20 }}>
                    <ArrowLeft2 color="#000" size={32} />
                </Pressable>
                <Text style={styles.title}>Login</Text>

                <View style={{ position: "absolute", top: screenHeight * 0.15, width: "100%" }}>
                    <View style={{ ...styles.inputContainer, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: error ? "#D41111" : "rgba(60, 60, 67, 0.4)" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                <Text style={styles.inputLabel}>Email</Text>
                            </View>
                            <TextInput value={email} style={styles.input} placeholder='email@example.com' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{ alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "white", }}>
                                <Text style={styles.inputLabel}>Password</Text>
                            </View>
                            <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                        </View>
                    </View>
                    <Text style={styles.error}>{error}</Text>
                </View>

                {email && password
                    ? <Pressable onPress={async () => {
                        signIn();
                        await AsyncStorage.setItem("@onboardingDone", "true")
                    }}
                        style={styles.infoButton}>
                        <Text style={styles.infoButtonText}>Let's go!</Text>
                    </Pressable>
                    : <Pressable
                        style={styles.infoButton}>
                        <Text style={styles.infoButtonDisabledText}>Let's go!</Text>
                    </Pressable>
                }



                {/* <Text style={styles.infoText}>Or continue with</Text> */}

                <View style={styles.thirdPartyButtonContainer}>
                    <GoogleSigninButton style={styles.GoogleButton} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={signInWithGoogle}>

                    </GoogleSigninButton>
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={5}
                        style={styles.appleButton}
                        onPress={async () => {
                            try {
                                const appleCredential = await AppleAuthentication.signInAsync({
                                    requestedScopes: [
                                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                                        AppleAuthentication.AppleAuthenticationScope.EMAIL,
                                    ],
                                });
                                const { identityToken } = appleCredential;
                                if (identityToken) {
                                    const provider = new OAuthProvider('apple.com');
                                    const credential = provider.credential({
                                        idToken: identityToken,
                                        rawNonce: appleCredential.authorizationCode
                                    })
                                    await signInWithCredential(auth, credential);
                                }
                                else
                                    setError("Something went wrong!")
                            } catch (e) {
                                if (e.code === 'ERR_REQUEST_CANCELED') {
                                    // handle that the user canceled the sign-in flow
                                } else {
                                    // handle other errors
                                }
                                console.log(e)
                                setError("Something went wrong!")

                            }
                        }}
                    />
                </View>
            </View>

            <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", position: "absolute", top: screenHeight * 0.9, alignSelf: "center" }}>
                <Text style={styles.swapPage}>Don't have an account? </Text>
                <Pressable onPress={() => { navigation.navigate("SignUpScreen") }}><Text style={{ ...styles.swapPage, textDecorationLine: "underline" }}>Sign up here!</Text></Pressable>
            </View>
        </SafeAreaView>
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
        top: screenHeight * 0.31,
        position: "absolute",

    },
    infoButtonText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
    },
    infoButtonDisabledText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
        color: "rgba(0, 0, 0, 0.4)"
    },
    thirdPartyButtonContainer: {
        top: screenHeight * 0.5,
        position: "absolute",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    iconButton: {
        padding: 10,
        borderRadius: 15,
        borderWidth: 1
    },
    error: {
        color: "#D41111",
        alignSelf: "center",
        marginTop: 10
    },
    swapPage: {
        fontFamily: "SF-Pro",
        fontSize: 15
    },
    appleButton: {
        width: "100%",
        height: 50
    }

});




