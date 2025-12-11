import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";

type Property = {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  location: string | null;
  status: string | null;
};

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/properties/?limit=50`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = (await res.json()) as Property[];
        setProperties(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar propriedades");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CRM PLUS Mobile</Text>
      <Text style={styles.subtitle}>Backend: {API_BASE}</Text>
      {loading && <ActivityIndicator size="large" color="#0ea5e9" />}
      {error && <Text style={styles.error}>Erro: {error}</Text>}
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.badge}>{item.status || "—"}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{item.location || "Sem localização"}</Text>
            <View style={styles.row}>
              <Text style={styles.tag}>€ {item.price ?? "—"}</Text>
              <Text style={styles.tag}>Área: {item.area ? `${item.area} m²` : "—"}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading && !error ? <Text>Nenhuma propriedade encontrada.</Text> : null}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 16,
  },
  error: {
    color: "#dc2626",
    marginVertical: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  cardSubtitle: {
    color: "#475569",
    marginTop: 4,
    marginBottom: 6,
  },
  badge: {
    fontSize: 12,
    color: "#0ea5e9",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  tag: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#0f172a",
    fontWeight: "600",
  },
});
