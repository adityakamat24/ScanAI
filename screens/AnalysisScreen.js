// screens/AnalysisScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Card, ActivityIndicator, Paragraph, Button, Title } from 'react-native-paper';

export default function AnalysisScreen({ route, navigation }) {
    const { imageUri } = route.params;
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState('');

    useEffect(() => {
        // STUB: replace this block with your real API call later
        const dummyReport = `
Ingredients detected: water, sugar, salt, citric acid.

Safety Rating: B

Child/Adult Warning:
• Adults: Safe.
• Children under 5: May be high in sodium.

Synergy Warning:
• Sugar + salt may exacerbate blood pressure concerns.

Smarter Swap:
Replace sugar with a natural sweetener (stevia).

Cumulative Exposure: Moderate over daily use.
    `.trim();

        const timer = setTimeout(() => {
            setReport(dummyReport);
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [imageUri]);

    if (loading) {
        return (
            <Card style={{ margin: 16, padding: 16, borderRadius: 8, elevation: 2 }}>
                <ActivityIndicator animating size="large" />
                <Paragraph style={{ marginTop: 12, textAlign: 'center' }}>
                    Processing your image, please wait...
                </Paragraph>
            </Card>
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
