import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFetchQuran } from "./useFetchQuran";

export default function QuranList() {
  const { surahs, loading, error } = useFetchQuran();
  const [highlightedAyah, setHighlightedAyah] = useState(null);
  const [timerId, setTimerId] = useState(null);

  // Clear any existing highlight timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  const highlightNextAyah = (currentSurahIndex, currentAyahIndex) => {
    // Clear any existing timers
    if (timerId) {
      clearTimeout(timerId);
    }
    
    const newTimer = setTimeout(() => {
      if (!surahs || surahs.length === 0) return;
      
      let newAyahIndex = currentAyahIndex + 1;
      if (newAyahIndex >= surahs[currentSurahIndex].ayahs.length) {
        // Move to next Surah if last Ayah is reached
        let newSurahIndex = currentSurahIndex + 1;
        if (newSurahIndex < surahs.length) {
          setHighlightedAyah({ surahIndex: newSurahIndex, ayahIndex: 0 });
          highlightNextAyah(newSurahIndex, 0);
        }
      } else {
        setHighlightedAyah({ surahIndex: currentSurahIndex, ayahIndex: newAyahIndex });
        highlightNextAyah(currentSurahIndex, newAyahIndex);
      }
    }, 5000);
    
    setTimerId(newTimer);
  };

  const handleAyahPress = (surahIndex, ayahIndex) => {
    setHighlightedAyah({ surahIndex, ayahIndex });
    highlightNextAyah(surahIndex, ayahIndex);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading Quran data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading Quran: {error}</Text>
        <Text>Please check your internet connection and try again.</Text>
      </View>
    );
  }

  // Create a flattened data structure for better performance
  const flattenedData = surahs.map(surah => ({
    id: `surah-${surah.number}`,
    type: 'surah',
    data: surah
  })).reduce((acc, surah) => {
    // Add the surah header
    acc.push(surah);
    
    // Add each ayah
    surah.data.ayahs.forEach((ayah, ayahIndex) => {
      acc.push({
        id: `ayah-${ayah.number}`,
        type: 'ayah',
        data: ayah,
        surahIndex: surahs.findIndex(s => s.number === surah.data.number),
        ayahIndex
      });
    });
    
    return acc;
  }, []);

  const renderItem = ({ item }) => {
    if (item.type === 'surah') {
      return (
        <View style={styles.surahContainer}>
          <Text style={styles.surahTitle}>
            {item.data.number}. {item.data.englishName}
          </Text>
        </View>
      );
    } else {
      return (
        <TouchableOpacity 
          onPress={() => handleAyahPress(item.surahIndex, item.ayahIndex)}
          style={styles.ayahContainer}
        >
          <Text
            style={[
              styles.ayahText,
              highlightedAyah?.surahIndex === item.surahIndex &&
              highlightedAyah?.ayahIndex === item.ayahIndex
                ? styles.highlighted
                : null,
            ]}
          >
            {item.data.numberInSurah}. {item.data.text}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <FlatList
      data={flattenedData}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  surahContainer: {
    padding: 15,
    backgroundColor: '#f0f7ff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  surahTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ayahContainer: {
    padding: 10,
    paddingLeft: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  ayahText: {
    fontSize: 16,
    lineHeight: 24,
  },
  highlighted: {
    backgroundColor: 'yellow',
    fontWeight: 'bold',
  },
});