import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
    const { colors } = useTheme();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem('history');
            setHistory(stored ? JSON.parse(stored) : []);
        })();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={history}
                keyExtractor={(_, i) => i.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Paragraph style={styles.emptyText}>No scans yet.</Paragraph>}
                renderItem={({ item }) => (
                    <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
                        <Card.Cover source={{ uri: item.imageUri }} style={styles.cover} />
                        <Card.Content>
                            <View style={styles.row}>
                                <Title numberOfLines={1} style={styles.date}>{new Date(item.date).toLocaleString()}</Title>
                            </View>
                            <Paragraph numberOfLines={2}>{item.report}</Paragraph>
                        </Card.Content>
                    </Card>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { padding: 16 },
    emptyText: { textAlign: 'center', marginTop: 60 },
    card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
    cover: { height: 150 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    date: { flex: 1, fontWeight: '600' },
});
