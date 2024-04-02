import { useFonts } from "expo-font";
import React from 'react';
import { Text, View, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function MacroPage({ route, navigation }) {
    console.log(route.params)
    return (<SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
        </View>
        {/* "food": food description,
        "emoji": one single food emoji that best represents the food,
        "kcal": amount of kilocalories,
        "fruit": amount of fruit in cups,
        "vegetables": amount of vegetables in cups,
        "grains": amount of grains in ounces,
        "protein": amount of protein in ounces,
        "dairy": amount of dairy in cups,
        "GIindex": estimated GI index of the food, */}
        <View style={styles.foodContainer}>
            <Text style={styles.foodName}>{route.params.food}</Text>
            <Image style={{ width: 300, height: 200 }} source={{ uri: route.params.image }}></Image>
            <View style={styles.macrosContainer}>
                <MacroDetail title="Calories: " value={route.params.kcal} />
                <MacroDetail title="Protein (oz): " value={route.params.protein} />
                <MacroDetail title="Vegetables (cups): " value={route.params.vegetables} />
                <MacroDetail title="Fruits (cups): " value={route.params.fruit} />
                <MacroDetail title="Grains (oz): " value={route.params.grains} />
                <MacroDetail title="Dairy (cups): " value={route.params.dairy} />
                <MacroDetail title="GI index: " value={route.params.GIindex} />
            </View>
        </View>
    </SafeAreaView>)
}
const MacroDetail = ({ title, value }) => (
    <View style={styles.macroDetailContainer}>
        <Text style={styles.macroTitle}>{title}</Text>
        <Text style={styles.macroValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d0f0c0', // Light green background for a spring theme
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        backgroundColor: '#8fbc8f', // Softer green
        borderRadius: 5,
        padding: 10,
    },
    backButtonText: {
        color: 'white',
        fontSize: 18,
    },
    foodContainer: {
        alignItems: 'center', // Center the content
        marginTop: 20,
    },
    foodName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2e8b57', // Darker green for contrast
        marginBottom: 20,
    },
    macrosContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    macroDetailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    macroTitle: {
        fontSize: 20,
        color: '#2e8b57',
    },
    macroValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#555', // Subtle color for the text
    },
});