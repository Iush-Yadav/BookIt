import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../styles/theme";

export default function BookingConfirmedScreen({ route, navigation }) {
  const booking = route.params.booking;
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Booking confirmed</Text>
      <Text style={styles.venue}>{booking.venue.name}</Text>
      <Text style={styles.meta}>{new Date(booking.start_at).toLocaleString()} • {booking.party_size} guests</Text>
      {booking.assigned_table_id ? <Text style={styles.table}>Assigned table {booking.assigned_table_id.split("-").pop()}</Text> : <Text style={styles.table}>Table to be assigned</Text>}
      {booking.assignment_changed ? <Text style={styles.changed}>Restaurant assigned a different table.</Text> : null}
      <Pressable style={styles.button} onPress={() => navigation.replace("MyBookings")}><Text style={styles.buttonText}>Back to My Bookings</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  title: { fontSize: 36, fontWeight: "900", color: colors.primary },
  venue: { fontSize: 24, fontWeight: "900", color: colors.text, marginTop: 14 },
  meta: { color: colors.muted, marginTop: 8 },
  table: { color: colors.text, fontWeight: "800", marginTop: 18 },
  changed: { color: colors.danger, marginTop: 8, fontWeight: "800" },
  button: { backgroundColor: colors.primary, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 30 },
  buttonText: { color: colors.surface, fontWeight: "900" }
});
