// screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Title, Paragraph } from 'react-native-paper';

export default function DashboardScreen() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        AsyncStorage.getItem('history').then((json) => {
            if (json) setHistory(JSON.parse(json));
        });
    }, []);

    return (
        <FlatList
            contentContainerStyle={{ padding: 16 }}
            data={history}
            keyExtractor={(_, i) => i.toString()}
            ListEmptyComponent={
                <Paragraph style={{ textAlign: 'center', marginTop: 32 }}>
                    No scans yet.
                </Paragraph>
            }
            renderItem={({ item }) => (
                <Card style={{ marginBottom: 16, borderRadius: 8, elevation: 2 }}>
                    <Card.Cover source={{ uri: item.imageUri }} style={{ borderRadius: 8 }} />
                    <Card.Content>
                        <Title>{new Date(item.date).toLocaleString()}</Title>
                        <Paragraph numberOfLines={3}>{item.report}</Paragraph>
                    </Card.Content>
                </Card>
            )}
        />
    );
}
