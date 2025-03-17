import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://api.alquran.cloud/v1/quran/en.asad";
const CACHE_KEY = "quranData";
const CACHE_EXPIRY = "quranDataExpiry";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function useFetchQuran() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuran = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if data exists in AsyncStorage and is not expired
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        const cachedExpiry = await AsyncStorage.getItem(CACHE_EXPIRY);
        const now = new Date().getTime();
        
        if (cachedData && cachedExpiry && now < parseInt(cachedExpiry)) {
          // Use cached data if it's not expired
          setSurahs(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Fetch from API if no cached data or if it's expired
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const json = await response.json();
        
        if (json.code !== 200 || !json.data || !json.data.surahs) {
          throw new Error("Invalid data format from API");
        }
        
        // Store in AsyncStorage with expiry
        const expiryTime = new Date().getTime() + CACHE_DURATION;
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(json.data.surahs));
        await AsyncStorage.setItem(CACHE_EXPIRY, expiryTime.toString());
        
        setSurahs(json.data.surahs);
      } catch (error) {
        console.error("Error fetching Quran data:", error);
        setError(error.message);
        
        // Try to use cached data even if expired as fallback
        try {
          const cachedData = await AsyncStorage.getItem(CACHE_KEY);
          if (cachedData) {
            setSurahs(JSON.parse(cachedData));
          }
        } catch (storageError) {
          console.error("Error reading cached data:", storageError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuran();
  }, []);

  return { surahs, loading, error };
}