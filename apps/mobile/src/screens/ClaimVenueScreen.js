import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { hostApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

export default function ClaimVenueScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/venues", { params: { search } });
      setVenues(data.venues);
    } catch (error) {
      Alert.alert("Could not find venues", serverMessage(error));
    }
  }

  async function claim(venue) {
    try {
      await api.post("/host/claims", { venue_id: venue.id });
      navigation.replace("HostHome");
    } catch (error) {
      Alert.alert("Claim failed", serverMessage(error));
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Find your venue</Text>
      <Text style={styles.subtitle}>BookIt prepares venue data and booking requests for you.</Text>
      <View style={styles.searchRow}>
        <TextInput style={styles.search} value={search} onChangeText={setSearch} onSubmitEditing={load} placeholder="Search Rourkela venues" />
        <Pressable style={styles.searchButton} onPress={load}><Text style={styles.searchText}>Search</Text></Pressable>
      </View>
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => claim(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.address}</Text>
            <Text style={styles.claim}>Select and claim</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  title: { fontSize: 34, color: colors.text, fontWeight: "900", paddingHorizontal: 18 },
  subtitle: { color: colors.muted, paddingHorizontal: 18, marginTop: 6 },
  searchRow: { flexDirection: "row", padding: 18, gap: 8 },
  search: { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16 },
  searchButton: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 16, justifyContent: "center" },
  searchText: { color: colors.surface, fontWeight: "900" },
  list: { padding: 18 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 12 },
  name: { color: colors.text, fontWeight: "900", fontSize: 19 },
  meta: { color: colors.muted, marginTop: 5 },
  claim: { color: colors.primary, fontWeight: "900", marginTop: 12 }
});
