import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const useAtsGeo = () => {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [selectedCountryName, setSelectedCountryName] = useState('');

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const res = await axios.get(`${API_URL}/ats/geo/countries`, { headers });
                setCountries(res.data || []);
            } catch (err) {
                console.error("Failed to fetch countries from geo API", err);
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            if (!selectedCountryName) {
                setStates([]);
                return;
            }
            setLoadingStates(true);
            try {
                const res = await axios.get(`${API_URL}/ats/geo/states`, {
                    params: { country: selectedCountryName },
                    headers
                });
                setStates(res.data || []);
            } catch (err) {
                console.error(`Failed to fetch states for country: ${selectedCountryName}`, err);
                setStates([]);
            } finally {
                setLoadingStates(false);
            }
        };
        fetchStates();
    }, [selectedCountryName]);

    return {
        countries,
        states,
        loadingCountries,
        loadingStates,
        selectedCountryName,
        setSelectedCountryName
    };
};
