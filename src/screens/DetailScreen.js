import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Wind, Droplets, Thermometer, Cloud, Sun, CloudRain } from 'lucide-react-native';
import { Colors, Gradients } from '../theme/colors';

const DetailScreen = ({ route, navigation }) => {
    const { forecastData } = route.params;

    const WeatherIcon = () => {
        const main = forecastData.weather[0].main;
        if (main === 'Clear') return <Sun color={Colors.accent} size={80} />;
        if (main === 'Rain') return <CloudRain color={Colors.accent} size={80} />;
        return <Cloud color={Colors.accent} size={80} />;
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.main} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color={Colors.text} size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Details</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.mainInfo}>
                        <Text style={styles.date}>{new Date(forecastData.dt * 1000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                        <Text style={styles.time}>{new Date(forecastData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

                        <View style={styles.iconContainer}>
                            <WeatherIcon />
                        </View>

                        <View style={styles.tempContainer}>
                            <Text style={styles.temp}>{Math.round(forecastData.main.temp)}</Text>
                            <Text style={styles.degree}>°C</Text>
                        </View>
                        <Text style={styles.desc}>{forecastData.weather[0].description}</Text>
                    </View>

                    <View style={styles.grid}>
                        <View style={styles.card}>
                            <Wind color={Colors.accent} size={24} />
                            <Text style={styles.cardValue}>{parseFloat(forecastData.wind.speed.toFixed(1))} m/s</Text>
                            <Text style={styles.cardLabel}>Wind Speed</Text>
                        </View>
                        <View style={styles.card}>
                            <Droplets color={Colors.accent} size={24} />
                            <Text style={styles.cardValue}>{forecastData.main.humidity}%</Text>
                            <Text style={styles.cardLabel}>Humidity</Text>
                        </View>
                        <View style={styles.card}>
                            <Thermometer color={Colors.accent} size={24} />
                            <Text style={styles.cardValue}>{Math.round(forecastData.main.feels_like)}°C</Text>
                            <Text style={styles.cardLabel}>Feels Like</Text>
                        </View>
                        <View style={styles.card}>
                            <Cloud color={Colors.accent} size={24} />
                            <Text style={styles.cardValue}>{forecastData.main.pressure} hPa</Text>
                            <Text style={styles.cardLabel}>Pressure</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        color: Colors.text,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    mainInfo: {
        alignItems: 'center',
        marginBottom: 40,
    },
    date: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
    },
    time: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4,
    },
    iconContainer: {
        marginVertical: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 30,
        borderRadius: 100,
    },
    tempContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    temp: {
        fontSize: 80,
        color: Colors.text,
        fontWeight: 'bold',
    },
    degree: {
        fontSize: 30,
        color: Colors.accent,
        marginTop: 15,
        fontWeight: '300',
    },
    desc: {
        fontSize: 24,
        color: Colors.text,
        textTransform: 'capitalize',
        marginTop: -5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    card: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardValue: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    cardLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
    },
});

export default DetailScreen;
