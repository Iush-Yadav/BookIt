import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { hostApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";
import { countdownLabel } from "../utils/countdown";

export default function BookingRequestDetailScreen({ route, navigation }) {
  const [booking, setBooking] = useState(route.params.booking);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(route.params.booking.requested_table_id);

  useEffect(() => {
    async function loadTables() {
      try {
        const { data } = await api.get(`/venues/${booking.venue_id}/layout`);
        setTables(data.layout.tables);
      } catch (error) {
        Alert.alert("Could not load tables", serverMessage(error));
      }
    }
    loadTables();
  }, [booking.venue_id]);

  async function accept() {
    try {
      const { data } = await api.post(`/host/bookings/${booking.id}/accept`, { assigned_table_id: selectedTable });
      setBooking(data.booking);
      navigation.replace("Bookings");
    } catch (error) {
      Alert.alert("Accept failed", serverMessage(error));
    }
  }

  async function decline(reason) {
    try {
      await api.post(`/host/bookings/${booking.id}/decline`, { reason });
      navigation.replace("Bookings");
    } catch (error) {
      Alert.alert("Decline failed", serverMessage(error));
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Booking Request</Text>
      <View style={styles.card}>
        <Text style={styles.customer}>{booking.customer_name}</Text>
        <Text style={styles.meta}>{booking.party_size} guests • {new Date(booking.start_at).toLocaleString()}</Text>
        <Text style={styles.meta}>{booking.booking_type.replace("_", " ")}</Text>
        {booking.requested_table_id ? <Text style={styles.requested}>Customer requested {booking.requested_table_id.split("-").pop()}</Text> : null}
        {booking.special_request ? <Text style={styles.note}>{booking.special_request}</Text> : null}
        <Text style={styles.countdown}>{countdownLabel(booking.expires_at)}</Text>
      </View>
      {booking.booking_type === "table_specific" ? (
        <View>
          <Text style={styles.section}>Use another table</Text>
          <FlatList
            horizontal
            data={tables}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={[styles.table, selectedTable === item.id && styles.tableActive]} onPress={() => setSelectedTable(item.id)}>
                <Text style={[styles.tableText, selectedTable === item.id && styles.tableTextActive]}>{item.label}</Text>
                <Text style={[styles.tableSeats, selectedTable === item.id && styles.tableTextActive]}>{item.capacity} seats</Text>
              </Pressable>
            )}
          />
        </View>
      ) : null}
      <Pressable style={styles.accept} onPress={accept}><Text style={styles.acceptText}>Accept</Text></Pressable>
      {["Fully booked", "Requested time unavailable", "Party size cannot be accommodated", "Private event", "Closing early", "Other"].map((reason) => (
        <Pressable key={reason} style={styles.decline} onPress={() => decline(reason)}><Text style={styles.declineText}>{reason}</Text></Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 18, paddingTop: 56 },
  title: { color: colors.text, fontSize: 32, fontWeight: "900" },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 22, padding: 16, marginTop: 16 },
  customer: { color: colors.text, fontSize: 24, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 5 },
  requested: { color: colors.primary, fontWeight: "900", marginTop: 12 },
  note: { color: colors.text, marginTop: 12 },
  countdown: { color: colors.primary, fontSize: 30, fontWeight: "900", marginTop: 14 },
  section: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 20, marginBottom: 10 },
  table: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14, marginRight: 8, width: 86 },
  tableActive: { backgroundColor: colors.primary },
  tableText: { color: colors.text, fontWeight: "900" },
  tableSeats: { color: colors.muted, marginTop: 3 },
  tableTextActive: { color: colors.surface },
  accept: { backgroundColor: colors.success, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 24 },
  acceptText: { color: colors.surface, fontWeight: "900" },
  decline: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 999, padding: 13, alignItems: "center", marginTop: 8 },
  declineText: { color: colors.primary, fontWeight: "800" }
});
