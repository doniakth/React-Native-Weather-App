export const mockCurrentWeather = {
    weather: [{ description: 'clear sky', main: 'Clear', icon: '01d' }],
    main: { temp: 28, humidity: 45, pressure: 1013 },
    name: 'New Delhi',
    dt: Math.floor(Date.now() / 1000),
};

export const mockForecast = {
    list: Array.from({ length: 40 }, (_, i) => ({
        dt: Math.floor(Date.now() / 1000) + i * 3600 * 3,
        main: {
            temp: 20 + Math.floor(Math.random() * 10),
            humidity: 40 + Math.floor(Math.random() * 20),
            pressure: 1010 + Math.floor(Math.random() * 10),
        },
        weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
        wind: { speed: 5 + Math.random() * 5 },
    })),
};
