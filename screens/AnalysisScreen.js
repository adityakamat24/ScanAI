// screens/AnalysisScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeImageWithOpenAI } from '../services/OpenAI';

export default function AnalysisScreen({ route, navigation }) {
    const { imageUri } = route.params;
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState('');

    useEffect(() => {
        (async () => {
            const profJson = await AsyncStorage.getItem('userProfile');
            const profile = profJson ? JSON.parse(profJson) : {};
            const { text, usage } = await analyzeImageWithOpenAI(imageUri, profile);
            setReport(text);

            // save to history
            const histJson = await AsyncStorage.getItem('history') || '[]';
            const history = JSON.parse(histJson);
            history.unshift({ date: Date.now(), imageUri, report: text, usage });
            await AsyncStorage.setItem('history', JSON.stringify(history));

            setLoading(false);
        })();
    }, []);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    return (
        <ScrollView style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Analysis</Text>
            <Text style={{ marginVertical: 12 }}>{report}</Text>
            <Button title="View Dashboard" onPress={() => navigation.navigate('Dashboard')} />
        </ScrollView>
    );
}
