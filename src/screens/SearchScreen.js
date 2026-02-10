import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, SafeAreaView, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setCity, getWeather, getSuggestions, clearSuggestions } from '../redux/slices/weatherSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X, MapPin } from 'lucide-react-native';
import { Colors, Gradients } from '../theme/colors';

const SearchScreen = ({ navigation }) => {
    const [input, setInput] = useState('');
    const dispatch = useDispatch();
    const { forecastDays, suggestions } = useSelector((state) => state.weather);

    useEffect(() => {
        if (input.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                dispatch(getSuggestions(input));
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            dispatch(clearSuggestions());
        }
    }, [input]);

    const handleSearch = (cityName) => {
        const query = cityName || input;
        if (query.trim()) {
            dispatch(setCity(query));
            dispatch(getWeather({ city: query, days: forecastDays }));
            dispatch(clearSuggestions());
            navigation.navigate('Home');
        }
    };

    const renderSuggestion = ({ item }) => (
        <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSearch(item)}>
            <MapPin color="rgba(255, 255, 255, 0.5)" size={18} />
            <Text style={styles.suggestionText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={Gradients.main} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <X color={Colors.text} size={24} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Search City</Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <View style={styles.inputWrapper}>
                            <Search color="rgba(255, 255, 255, 0.5)" size={20} style={styles.searchIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter city name..."
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                value={input}
                                onChangeText={setInput}
                                autoFocus
                            />
                        </View>
                    </View>

                    {suggestions.length > 0 && (
                        <View style={styles.suggestionsListContainer}>
                            <FlatList
                                data={suggestions}
                                renderItem={renderSuggestion}
                                keyExtractor={(item) => item}
                                style={styles.suggestionsList}
                            />
                        </View>
                    )}

                    <View style={styles.popularSection}>
                        <Text style={styles.subtitle}>Popular Cities</Text>
                        <View style={styles.cityChips}>
                            {['Mumbai', 'London', 'New York', 'Tokyo', 'Paris'].map((city) => (
                                <TouchableOpacity
                                    key={city}
                                    style={styles.chip}
                                    onPress={() => handleSearch(city)}
                                >
                                    <Text style={styles.chipText}>{city}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
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
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 24,
        color: Colors.text,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
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
    input: {
        flex: 1,
        color: Colors.text,
        paddingVertical: 15,
        fontSize: 18,
    },
    suggestionsListContainer: {
        marginTop: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        maxHeight: 250,
        overflow: 'hidden',
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
    popularSection: {
        marginTop: 40,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
    },
    cityChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chipText: {
        color: Colors.text,
        fontSize: 14,
    },
});

export default SearchScreen;
