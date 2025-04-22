// screens/AnalysisScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, ActivityIndicator, Paragraph, Button, Title } from 'react-native-paper';
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

            const histJson = (await AsyncStorage.getItem('history')) || '[]';
            const history = JSON.parse(histJson);
            history.unshift({ date: Date.now(), imageUri, report: text, usage });
            await AsyncStorage.setItem('history', JSON.stringify(history));

            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <ActivityIndicator
                animating
                size="large"
                style={{ flex: 1, justifyContent: 'center' }}
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Card style={{ borderRadius: 8, elevation: 4, marginBottom: 16 }}>
                <Card.Content>
                    <Title>Analysis Result</Title>
                    <Paragraph>{report}</Paragraph>
                </Card.Content>
                <Card.Actions>
                    <Button mode="contained" onPress={() => navigation.navigate('Dashboard')}>
                        View Dashboard
                    </Button>
                </Card.Actions>
            </Card>
        </ScrollView>
    );
}
