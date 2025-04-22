import React, { useEffect, useState } from 'react';
import { ScrollView, Image, StyleSheet, View, SafeAreaView } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme, ActivityIndicator } from 'react-native-paper';

export default function AnalysisScreen({ route, navigation }) {
    const { colors } = useTheme();
    const { imageUri } = route.params;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ report: '', rating: 'B', warnings: [], synergy: [], swap: '' });

    useEffect(() => {
        const timer = setTimeout(() => {
            setData({ report: 'Ingredients: water, sugar, salt.', rating: 'B', warnings: ['High sodium'], synergy: ['Sugar + salt may raise blood pressure'], swap: 'Use stevia instead of sugar' });
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
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