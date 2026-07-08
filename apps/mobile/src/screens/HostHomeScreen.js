import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { hostApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";
import { countdownLabel } from "../utils/countdown";

export default function HostHomeScreen({ navigation }) {
  const [home, setHome] = useState(null);
  const [tick, setTick] = useState(0);

  async function load() {
    try {
      const { data } = await api.get("/host/home");
      setHome(data);
    } catch (error) {
      Alert.alert("Could not load dashboard", serverMessage(error));
      navigation.replace("ClaimVenue");
    }
  }

  async function accept(id) {
    try {
      await api.post(`/host/bookings/${id}/accept`, {}, { headers: { "Idempotency-Key": `accept-${id}` } });
      load();
    } catch (error) {
      Alert.alert("Accept failed", serverMessage(error));
    }
  }

  async function decline(id) {
    try {
      await api.post(`/host/bookings/${id}/decline`, { reason: "Requested time unavailable" }, { headers: { "Idempotency-Key": `decline-${id}` } });
      load();
    } catch (error) {
      Alert.alert("Decline failed", serverMessage(error));
    }
  }

  async function toggleBookingStatus() {
    try {
      const nextStatus = home.venue.booking_status === "accepting_requests" ? "paused" : "accepting_requests";
      const { data } = await api.put("/host/venue/booking-status", { booking_status: nextStatus });
      setHome((current) => ({ ...current, venue: data.venue, accepting_requests: nextStatus === "accepting_requests" }));
    } catch (error) {
      Alert.alert("Status update failed", serverMessage(error));
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!home) return <View style={styles.screen}><Text style={styles.loading}>Loading...</Text></View>;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.venue}>{home.venue.name}</Text>
          <Text style={styles.today}>{new Date().toDateString()}</Text>
        </View>
        <Pressable style={styles.toggle} onPress={toggleBookingStatus}>
          <Text style={styles.toggleText}>{home.accepting_requests ? "Accepting Requests" : "Paused"}</Text>
        </Pressable>
      </View>
      <View style={styles.stats}>
        {Object.entries(home.stats).map(([key, value]) => (
          <View style={styles.stat} key={key}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{key.replaceAll("_", " ")}</Text></View>
        ))}
      </View>
      <View style={styles.navRow}>
        <Pressable onPress={() => navigation.navigate("Bookings")}><Text style={styles.nav}>Bookings</Text></Pressable>
        <Pressable onPress={() => navigation.navigate("VenueProfile", { venue: home.venue })}><Text style={styles.nav}>Venue Profile</Text></Pressable>
      </View>
      <Text style={styles.section}>New Booking Requests</Text>
      <FlatList
        data={home.new_requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        extraData={tick}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("BookingRequestDetail", { booking: item })}>
            <Text style={styles.customer}>{item.customer_name}</Text>
            <Text style={styles.meta}>{item.party_size} guests • {new Date(item.start_at).toLocaleString()}</Text>
            <Text style={styles.meta}>{item.booking_type.replace("_", " ")} {item.requested_table_id ? `• ${item.requested_table_id.split("-").pop()}` : ""}</Text>
            <Text style={styles.countdown}>{countdownLabel(item.expires_at)}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.accept} onPress={() => accept(item.id)}><Text style={styles.actionText}>ACCEPT</Text></Pressable>
              <Pressable style={styles.decline} onPress={() => decline(item.id)}><Text style={styles.declineText}>DECLINE</Text></Pressable>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No new requests.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 56 },
  loading: { color: colors.muted, margin: 24 },
  header: { paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  venue: { color: colors.text, fontSize: 26, fontWeight: "900", maxWidth: 210 },
  today: { color: colors.muted, marginTop: 4 },
  toggle: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 12, height: 38, justifyContent: "center" },
  toggleText: { color: colors.primary, fontWeight: "900", fontSize: 12 },
  stats: { flexDirection: "row", flexWrap: "wrap", padding: 18, gap: 10 },
  stat: { width: "47%", backgroundColor: colors.surface, borderRadius: 18, padding: 14, borderColor: colors.border, borderWidth: 1 },
  statValue: { color: colors.text, fontSize: 26, fontWeight: "900" },
  statLabel: { color: colors.muted, marginTop: 4 },
  navRow: { flexDirection: "row", gap: 18, paddingHorizontal: 18 },
  nav: { color: colors.primary, fontWeight: "900" },
  section: { paddingHorizontal: 18, color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 18 },
  list: { padding: 18 },
  card: { backgroundColor: colors.surface, borderRadius: 22, borderColor: colors.border, borderWidth: 1, padding: 16, marginBottom: 14 },
  customer: { color: colors.text, fontSize: 21, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 5 },
  countdown: { color: colors.primary, fontSize: 26, fontWeight: "900", marginTop: 10 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  accept: { flex: 1, backgroundColor: colors.success, borderRadius: 999, padding: 14, alignItems: "center" },
  decline: { flex: 1, borderColor: colors.primary, borderWidth: 1, borderRadius: 999, padding: 14, alignItems: "center" },
  actionText: { color: colors.surface, fontWeight: "900" },
  declineText: { color: colors.primary, fontWeight: "900" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 30 }
});
