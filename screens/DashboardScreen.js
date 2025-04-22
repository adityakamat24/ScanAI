// screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        AsyncStorage.getItem('history').then(json => {
            if (json) setHistory(JSON.parse(json));
        });
    }, []);

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Scan History</Text>
            <FlatList
                data={history}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontWeight: 'bold' }}>{new Date(item.date).toLocaleString()}</Text>
                        <Image source={{ uri: item.imageUri }} style={{ width: 100, height: 100, marginVertical: 8 }} />
                        <Text numberOfLines={3}>{item.report}</Text>
                    </View>
                )}
            />
        </View>
    );
}
