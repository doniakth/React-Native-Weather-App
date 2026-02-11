import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setCity, getWeather } from '../redux/slices/weatherSlice';
import { removeFavorite } from '../redux/slices/favoritesSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Trash2, MapPin, Star } from 'lucide-react-native';
import { Colors, Gradients } from '../theme/colors';

const FavoritesScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { cities } = useSelector((state) => state.favorites);
    const { forecastDays } = useSelector((state) => state.weather);

    const handleSelectCity = (city) => {
        dispatch(setCity(city));
        dispatch(getWeather({ city, days: forecastDays }));
        navigation.navigate('Home');
    };

    const handleRemove = (city) => {
        dispatch(removeFavorite(city));
    };

    const renderItem = ({ item }) => (
        <View style={styles.favoriteItem}>
            <TouchableOpacity
                style={styles.cityInfo}
                onPress={() => handleSelectCity(item)}
            >
                <MapPin color={Colors.accent} size={20} />
                <Text style={styles.cityName}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item)}
            >
                <Trash2 color="#ff4d4d" size={20} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.main} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ChevronLeft color={Colors.text} size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Favorite Cities</Text>
                </View>

                {cities.length > 0 ? (
                    <FlatList
                        data={cities}
                        renderItem={renderItem}
                        keyExtractor={(item) => item}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Star color="rgba(255, 255, 255, 0.1)" size={100} fill="rgba(255, 255, 255, 0.05)" />
                        <Text style={styles.emptyText}>No favorite cities yet.</Text>
                        <Text style={styles.emptySubtext}>Add cities from the search bar to see them here.</Text>
                    </View>
                )}
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
        marginRight: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 5,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 24,
        color: Colors.text,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
    },
    favoriteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cityName: {
        fontSize: 18,
        color: Colors.text,
        marginLeft: 12,
        fontWeight: '600',
    },
    removeButton: {
        padding: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 20,
        color: Colors.text,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default FavoritesScreen;
