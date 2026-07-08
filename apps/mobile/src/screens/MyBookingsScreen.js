import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { customerApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";
import { countdownLabel } from "../utils/countdown";

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/bookings/mine");
      setBookings(data.bookings);
    } catch (error) {
      Alert.alert("Could not load bookings", serverMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id) {
    try {
      await api.post(`/bookings/${id}/cancel`);
      load();
    } catch (error) {
      Alert.alert("Cancel failed", serverMessage(error));
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Pressable onPress={() => navigation.navigate("RestaurantsList")}><Text style={styles.link}>Browse</Text></Pressable>
      </View>
      <FlatList
        data={bookings}
        refreshing={loading}
        onRefresh={load}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.venue.name}</Text>
            <Text style={styles.meta}>{new Date(item.start_at).toLocaleString()} • {item.party_size} guests</Text>
            <Text style={styles.status}>{item.status.replaceAll("_", " ")}</Text>
            {item.status === "pending_restaurant" ? <Text style={styles.countdown}>Waiting for restaurant confirmation {countdownLabel(item.expires_at)}</Text> : null}
            {item.status === "confirmed" ? <Text style={styles.countdown}>Arrive by {new Date(new Date(item.start_at).getTime() + 30 * 60000).toLocaleTimeString()}</Text> : null}
            {item.status === "declined" ? <Text style={styles.reason}>{item.decline_reason || "Restaurant declined this request"}</Text> : null}
            {item.status === "expired" ? <Text style={styles.reason}>Restaurant did not respond in time</Text> : null}
            {["pending_restaurant", "confirmed"].includes(item.status) ? <Pressable style={styles.cancel} onPress={() => cancel(item.id)}><Text style={styles.cancelText}>Cancel</Text></Pressable> : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No bookings yet.</Text>}
        extraData={tick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  header: { paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.text, fontSize: 32, fontWeight: "900" },
  link: { color: colors.primary, fontWeight: "900" },
  list: { padding: 18 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, marginBottom: 14, borderColor: colors.border, borderWidth: 1 },
  name: { color: colors.text, fontSize: 20, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 5 },
  status: { color: colors.primary, fontWeight: "900", marginTop: 12 },
  countdown: { color: colors.text, fontWeight: "800", marginTop: 6 },
  reason: { color: colors.danger, fontWeight: "800", marginTop: 6 },
  cancel: { alignSelf: "flex-start", borderColor: colors.danger, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 12 },
  cancelText: { color: colors.danger, fontWeight: "800" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 }
});
