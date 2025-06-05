import React, { useEffect, useState } from 'react';
import { ScrollView, Image, StyleSheet, View, SafeAreaView } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeImageWithOpenAI } from '../services/OpenAI';

export default function AnalysisScreen({ route, navigation }) {
    const { colors } = useTheme();
    const { imageUri } = route.params;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ report: '', rating: 'B', warnings: [], synergy: [], swap: '' });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const profiles = JSON.parse(await AsyncStorage.getItem('profiles') || '[]');
                const activeId = await AsyncStorage.getItem('activeProfile');
                const profile = profiles.find(p => p.id === activeId) || {};
                const result = await analyzeImageWithOpenAI(imageUri, profile);
                if (cancelled) return;
                const report = result.text || 'No response';
                setData(d => ({ ...d, report }));
                const stored = await AsyncStorage.getItem('history');
                const all = stored ? JSON.parse(stored) : [];
                all.unshift({ imageUri, report, date: Date.now() });
                await AsyncStorage.setItem('history', JSON.stringify(all));
            } catch (e) {
                if (!cancelled) setData(d => ({ ...d, report: 'Analysis failed.' }));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [imageUri]);

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator animating size="large" color={colors.accent} />
                <Paragraph style={{ marginTop: 12 }}>Analyzing...</Paragraph>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: imageUri }} style={styles.preview} />

                <Section title="Safety Rating" color={colors.primary} content={data.rating} />
                <Section title="Warnings" color="#FFB74D" content={data.warnings.join(', ')} />
                <Section title="Synergy Alerts" color="#E57373" content={data.synergy.join(', ')} />
                <Section title="Smarter Swap" color="#81C784" content={data.swap} />
                <Section title="Summary" color="#64B5F6" content={data.report} />

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Dashboard')}
                    style={styles.viewButton}
                >
                    View Dashboard
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

function Section({ title, color, content }) {
    return (
        <Card style={[styles.section, { borderLeftColor: color }]} elevation={2}>
            <Card.Content>
                <Title>{title}</Title>
                <Paragraph>{content}</Paragraph>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16 },
    preview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
    section: { marginBottom: 12, borderLeftWidth: 6, borderRadius: 8 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    viewButton: { marginTop: 16, marginHorizontal: 16 },
});
