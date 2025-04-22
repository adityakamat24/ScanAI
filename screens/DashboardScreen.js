import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Title, Paragraph } from 'react-native-paper';

export default function DashboardScreen() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem('history');
            const all = stored ? JSON.parse(stored) : [];
            setHistory(all);
        })();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={history}
                keyExtractor={(_, i) => i.toString()}
                ListEmptyComponent={
                    <Paragraph style={{ textAlign: 'center', marginTop: 32 }}>
                        No scans yet.
                    </Paragraph>
                }
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Cover source={{ uri: item.imageUri }} style={styles.cover} />
                        <Card.Content>
                            <Title>{new Date(item.date).toLocaleString()}</Title>
                            <Paragraph numberOfLines={3}>{item.report}</Paragraph>
                        </Card.Content>
                    </Card>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
    card: { marginBottom: 16, borderRadius: 8, elevation: 2 },
    cover: { borderRadius: 8 },
});
