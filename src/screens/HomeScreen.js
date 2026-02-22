import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Dimensions, Platform, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getWeather, setForecastDays, setCity, getSuggestions, clearSuggestions } from '../redux/slices/weatherSlice';
import { toggleFavorite } from '../redux/slices/favoritesSlice';
import { Search, MapPin, Wind, Droplets, Thermometer, Calendar, X, Heart, List } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../theme/colors';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { current, forecast, loading, error, city, forecastDays, suggestions } = useSelector((state) => state.weather);
    const { cities: favoriteCities } = useSelector((state) => state.favorites);
    const [searchInput, setSearchInput] = useState('');
    const [locationPermission, setLocationPermission] = useState(null);

    // Request location permission and get current location on app load
    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                setLocationPermission(status === 'granted');

                if (status === 'granted') {
                    let location = await Location.getCurrentPositionAsync({});
                    const { latitude, longitude } = location.coords;

                    // Fetch weather using coordinates
                    dispatch(setCity(`${latitude},${longitude}`));
                } else {
                    // If permission denied, use default city
                    console.log('Location permission denied, using default city');
                }
            } catch (error) {
                console.error('Error getting location:', error);
            }
        })();
    }, []);

    useEffect(() => {
        dispatch(getWeather({ city, days: forecastDays }));
    }, [city, forecastDays]);

    useEffect(() => {
        if (searchInput.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                dispatch(getSuggestions(searchInput));
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            dispatch(clearSuggestions());
        }
    }, [searchInput]);

    const handleSearch = (cityName) => {
        const query = cityName || searchInput;
        if (query.trim()) {
            dispatch(setCity(query));
            setSearchInput('');
            dispatch(clearSuggestions());
        }
    };

    const isFavorite = (cityName) => {
        return favoriteCities.some(c => c.toLowerCase() === cityName?.toLowerCase());
    };

    const handleToggleFavorite = () => {
        if (current) {
            dispatch(toggleFavorite(current.name));
        }
    };

    const processForecastData = (list) => {
        // Open-Meteo returns one entry per day already — map directly
        return list.slice(0, forecastDays).map((item) => ({
            dt: item.dt,
            temp_max: item.main.temp_max,
            temp_min: item.main.temp_min,
            description: item.weather[0].main,
            humidity: item.main.humidity,
            wind: item.wind,
        }));
    };

    const dailyForecast = forecast ? processForecastData(forecast.list) : [];

    const renderForecastItem = ({ item }) => (
        <TouchableOpacity
            style={styles.forecastCard}
            onPress={() => navigation.navigate('Details', {
                forecastData: {
                    ...item,
                    main: {
                        temp: (item.temp_max + item.temp_min) / 2,
                        humidity: item.humidity,
                        pressure: 1013,
                        feels_like: item.temp_max
                    },
                    weather: [{
                        main: item.description,
                        description: item.description
                    }],
                    wind: item.wind || { speed: 0 }
                }
            })}
        >
            <LinearGradient colors={Gradients.card} style={styles.cardGradient}>
                <Text style={styles.forecastDate}>
                    {new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}
                </Text>
                <View style={styles.forecastTempRow}>
                    <Text style={styles.forecastTempMax}>{Math.round(item.temp_max)}°</Text>
                    <Text style={styles.forecastTempMin}>{Math.round(item.temp_min)}°</Text>
                </View>
                <Text style={styles.forecastDesc}>{item.description}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    if (loading) return (
        <View style={styles.center}><Text>Loading...</Text></View>
    );

    if (error) return (
        <View style={styles.center}><Text>Error: {error}</Text></View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.main} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.searchBarWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={[styles.searchInputContainer, { flex: 1 }]}>
                        <Search color={Colors.text} size={20} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search city..."
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={searchInput}
                            onChangeText={setSearchInput}
                            onSubmitEditing={() => handleSearch()}
                        />
                        {searchInput.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchInput(''); dispatch(clearSuggestions()); }}>
                                <X color={Colors.text} size={20} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.favoritesLinkButton}
                        onPress={() => navigation.navigate('Favorites')}
                    >
                        <List color={Colors.text} size={24} />
                    </TouchableOpacity>

                    {suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            {suggestions.map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionItem}
                                    onPress={() => handleSearch(suggestion)}
                                >
                                    <MapPin color={Colors.accent} size={16} />
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {current && (
                        <>
                            <View style={styles.locationHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <MapPin color={Colors.accent} size={20} />
                                    <Text style={styles.cityText}>{current.name}</Text>
                                </View>
                                <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                                    <Heart
                                        color={isFavorite(current.name) ? "#ff4d4d" : Colors.text}
                                        fill={isFavorite(current.name) ? "#ff4d4d" : "transparent"}
                                        size={24}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.mainTempContainer}>
                                <Text style={styles.tempText}>{Math.round(current.main.temp)}</Text>
                                <Text style={styles.degreeSymbol}>°C</Text>
                            </View>
                            <Text style={styles.descText}>{current.weather[0].description}</Text>

                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <Wind color={Colors.accent} size={24} />
                                    <Text style={styles.statValue}>{parseFloat((current.wind?.speed || 0).toFixed(1))} m/s</Text>
                                    <Text style={styles.statLabel}>Wind</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Droplets color={Colors.accent} size={24} />
                                    <Text style={styles.statValue}>{current.main.humidity}%</Text>
                                    <Text style={styles.statLabel}>Humidity</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Thermometer color={Colors.accent} size={24} />
                                    <Text style={styles.statValue}>{Math.round(current.main.feels_like || current.main.temp)}°</Text>
                                    <Text style={styles.statLabel}>Feels Like</Text>
                                </View>
                            </View>

                            <View style={styles.forecastHeader}>
                                <View style={styles.titleRow}>
                                    <Calendar color={Colors.accent} size={20} />
                                    <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>{forecastDays}-Day Forecast</Text>
                                </View>
                                <View style={styles.daysToggle}>
                                    {[3, 5, 7].map((days) => (
                                        <TouchableOpacity
                                            key={days}
                                            style={[styles.dayButton, forecastDays === days && styles.activeDayButton]}
                                            onPress={() => dispatch(setForecastDays(days))}
                                        >
                                            <Text style={[styles.dayButtonText, forecastDays === days && styles.activeDayButtonText]}>
                                                {days}D
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <FlatList
                                horizontal
                                data={dailyForecast}
                                renderItem={renderForecastItem}
                                keyExtractor={(item, index) => index.toString()}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.forecastList}
                            />
                        </>
                    )}
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
    scrollContent: {
        padding: 20,
    },
    searchBarWrapper: {
        paddingHorizontal: 20,
        paddingTop: 10,
        zIndex: 10,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: Colors.text,
        paddingVertical: 12,
        fontSize: 16,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: '#1e1e2e', // Solid background for visibility
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        zIndex: 1000, // Very high zIndex for web/mobile
        elevation: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    favoritesLinkButton: {
        marginLeft: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly brighter
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    favoriteButton: {
        padding: 5,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    suggestionText: {
        color: Colors.text,
        fontSize: 16,
        marginLeft: 10,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    cityText: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    mainTempContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    tempText: {
        fontSize: 100,
        color: Colors.text,
        fontWeight: '100',
    },
    degreeSymbol: {
        fontSize: 40,
        color: Colors.accent,
        marginTop: 20,
        fontWeight: '200',
    },
    descText: {
        fontSize: 22,
        color: 'rgba(255, 255, 255, 0.8)',
        textTransform: 'capitalize',
        marginTop: -10,
        marginBottom: 30,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: 2,
    },
    forecastHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        color: Colors.text,
        fontWeight: 'bold',
    },
    daysToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 4,
    },
    dayButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    activeDayButton: {
        backgroundColor: Colors.accent,
    },
    dayButtonText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: 'bold',
    },
    activeDayButtonText: {
        color: Colors.background,
    },
    forecastList: {
        paddingBottom: 20,
    },
    forecastCard: {
        width: 120,
        marginRight: 15,
        borderRadius: 20,
        overflow: 'hidden',
    },
    cardGradient: {
        padding: 15,
        alignItems: 'center',
        height: 140,
        justifyContent: 'center',
    },
    forecastDate: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    forecastTempRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    forecastTempMax: {
        color: Colors.text,
        fontSize: 22,
        fontWeight: 'bold',
        marginRight: 8,
    },
    forecastTempMin: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
        fontWeight: 'bold',
    },
    forecastDesc: {
        color: Colors.accent,
        fontSize: 12,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: Colors.text,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 40,
    },
    retryButton: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryText: {
        color: Colors.background,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default HomeScreen;
