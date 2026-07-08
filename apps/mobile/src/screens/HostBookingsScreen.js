import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { hostApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

const tabs = ["Requests", "Confirmed", "Today", "Past"];

export default function HostBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("Requests");

  async function load() {
    try {
      const { data } = await api.get("/host/bookings");
      setBookings(data.bookings);
    } catch (error) {
      Alert.alert("Could not load bookings", serverMessage(error));
    }
  }

  async function action(id, next) {
    try {
      await api.post(`/host/bookings/${id}/${next}`, next === "cancel" ? { reason: "Restaurant unavailable" } : {});
      load();
    } catch (error) {
      Alert.alert("Action failed", serverMessage(error));
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = bookings.filter((booking) => {
    if (tab === "Requests") return booking.status === "pending_restaurant";
    if (tab === "Confirmed") return booking.status === "confirmed";
    if (tab === "Today") return booking.start_at.startsWith(new Date().toISOString().slice(0, 10));
    return !["pending_restaurant", "confirmed", "arrived"].includes(booking.status);
  });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Pressable onPress={() => navigation.navigate("HostHome")}><Text style={styles.link}>Home</Text></Pressable>
      </View>
      <View style={styles.tabs}>{tabs.map((item) => (
        <Pressable key={item} style={[styles.tab, tab === item && styles.tabActive]} onPress={() => setTab(item)}>
          <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
        </Pressable>
      ))}</View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.customer}>{item.customer_name}</Text>
            <Text style={styles.meta}>{item.party_size} guests • {new Date(item.start_at).toLocaleString()}</Text>
            <Text style={styles.status}>{item.status.replaceAll("_", " ")}</Text>
            {item.assigned_table_id || item.requested_table_id ? <Text style={styles.meta}>{(item.assigned_table_id || item.requested_table_id).split("-").pop()}</Text> : null}
            {item.status === "pending_restaurant" ? <Pressable style={styles.action} onPress={() => navigation.navigate("BookingRequestDetail", { booking: item })}><Text style={styles.actionText}>Review</Text></Pressable> : null}
            {item.status === "confirmed" ? <View style={styles.row}><Pressable style={styles.action} onPress={() => action(item.id, "arrived")}><Text style={styles.actionText}>Mark Arrived</Text></Pressable><Pressable style={styles.cancel} onPress={() => action(item.id, "cancel")}><Text style={styles.cancelText}>Cancel</Text></Pressable></View> : null}
            {item.status === "arrived" ? <Pressable style={styles.action} onPress={() => action(item.id, "completed")}><Text style={styles.actionText}>Mark Completed</Text></Pressable> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  header: { paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.text, fontSize: 32, fontWeight: "900" },
  link: { color: colors.primary, fontWeight: "900" },
  tabs: { flexDirection: "row", padding: 18, gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.text, fontWeight: "800", fontSize: 12 },
  tabTextActive: { color: colors.surface },
  list: { padding: 18 },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderColor: colors.border, borderWidth: 1, padding: 16, marginBottom: 12 },
  customer: { color: colors.text, fontSize: 20, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 5 },
  status: { color: colors.primary, fontWeight: "900", marginTop: 10 },
  row: { flexDirection: "row", gap: 8 },
  action: { alignSelf: "flex-start", backgroundColor: colors.success, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12 },
  actionText: { color: colors.surface, fontWeight: "900" },
  cancel: { alignSelf: "flex-start", borderColor: colors.primary, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12 },
  cancelText: { color: colors.primary, fontWeight: "900" }
});
