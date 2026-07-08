import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { customerApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

const chips = ["All", "RESTAURANT", "CAFE", "BAR", "LOUNGE", "RESTRO_BAR", "BREWERY", "FINE_DINING", "ROOFTOP"];

export default function RestaurantsListScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/venues", { params: { search, category } });
      setVenues(data.venues);
    } catch (error) {
      Alert.alert("Could not load restaurants", serverMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [category]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>BookIt</Text>
          <Text style={styles.location}>Rourkela</Text>
        </View>
        <Pressable onPress={() => navigation.navigate("MyBookings")}><Text style={styles.my}>My Bookings</Text></Pressable>
      </View>
      <View style={styles.searchRow}>
        <TextInput style={styles.search} value={search} onChangeText={setSearch} onSubmitEditing={load} placeholder="Search restaurants, cafes, bars..." />
        <Pressable style={styles.searchButton} onPress={load}><Text style={styles.searchButtonText}>Search</Text></Pressable>
      </View>
      <FlatList
        horizontal
        data={chips}
        keyExtractor={(item) => item}
        style={styles.chips}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable style={[styles.chip, category === item && styles.chipActive]} onPress={() => setCategory(item)}>
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item.replace("_", " ")}</Text>
          </Pressable>
        )}
      />
      <FlatList
        data={venues}
        refreshing={loading}
        onRefresh={load}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("RestaurantDetail", { venueId: item.id })}>
            <View style={styles.imageMock}><Text style={styles.imageText}>{item.category.replace("_", " ")}</Text></View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.area} • {item.cuisines.join(", ")}</Text>
            <Text style={styles.requestable}>Request this time • Restaurant confirmation required</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No Rourkela venues found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  header: { paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 34, fontWeight: "900", color: colors.text },
  location: { color: colors.primary, fontWeight: "800", marginTop: 2 },
  my: { color: colors.primary, fontWeight: "800" },
  searchRow: { flexDirection: "row", padding: 18, gap: 8 },
  search: { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16 },
  searchButton: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 16, justifyContent: "center" },
  searchButtonText: { color: colors.surface, fontWeight: "800" },
  chips: { paddingLeft: 18, maxHeight: 48 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.border, marginRight: 8, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.text, fontWeight: "700", fontSize: 12 },
  chipTextActive: { color: colors.surface },
  list: { padding: 18, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 14, marginBottom: 16, borderColor: colors.border, borderWidth: 1 },
  imageMock: { height: 170, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  imageText: { color: colors.primary, fontWeight: "900" },
  name: { color: colors.text, fontWeight: "900", fontSize: 22 },
  meta: { color: colors.muted, marginTop: 4 },
  requestable: { color: colors.primary, marginTop: 12, fontWeight: "800" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 }
});
