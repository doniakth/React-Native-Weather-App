import weatherReducer, { setCity, setForecastDays } from './weatherSlice';

describe('weatherSlice', () => {
    const initialState = {
        current: null,
        forecast: null,
        loading: false,
        error: null,
        city: 'New Delhi',
        forecastDays: 7,
    };

    it('should return the initial state', () => {
        expect(weatherReducer(undefined, { type: undefined })).toEqual(initialState);
    });

    it('should handle setCity', () => {
        const actual = weatherReducer(initialState, setCity('London'));
        expect(actual.city).toEqual('London');
    });

    it('should handle setForecastDays', () => {
        const actual = weatherReducer(initialState, setForecastDays(5));
        expect(actual.forecastDays).toEqual(5);
    });
});
