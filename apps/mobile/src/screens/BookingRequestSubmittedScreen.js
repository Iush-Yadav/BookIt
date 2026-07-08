import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../styles/theme";
import { countdownLabel } from "../utils/countdown";

export default function BookingRequestSubmittedScreen({ route, navigation }) {
  const [tick, setTick] = useState(0);
  const booking = route.params.booking;

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.pulse}><Text style={styles.pulseText}>{tick % 2 ? "..." : ".."}</Text></View>
      <Text style={styles.title}>Request sent</Text>
      <Text style={styles.venue}>{booking.venue.name}</Text>
      <Text style={styles.meta}>{new Date(booking.start_at).toLocaleString()} • {booking.party_size} guests</Text>
      {booking.requested_table_id ? <Text style={styles.meta}>Requested table {booking.requested_table_id.split("-").pop()}</Text> : null}
      <View style={styles.statusBox}>
        <Text style={styles.status}>Waiting for restaurant confirmation</Text>
        <Text style={styles.countdown}>{countdownLabel(booking.expires_at)}</Text>
      </View>
      <Pressable style={styles.button} onPress={() => navigation.replace("MyBookings")}><Text style={styles.buttonText}>View My Bookings</Text></Pressable>
      <Pressable style={styles.secondary} onPress={() => navigation.replace("RestaurantsList")}><Text style={styles.secondaryText}>Browse More Places</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  pulse: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  pulseText: { color: colors.primary, fontSize: 28, fontWeight: "900" },
  title: { fontSize: 36, fontWeight: "900", color: colors.text },
  venue: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 10 },
  meta: { color: colors.muted, marginTop: 6 },
  statusBox: { backgroundColor: colors.surface, borderRadius: 22, padding: 18, marginTop: 24, borderColor: colors.border, borderWidth: 1 },
  status: { color: colors.primary, fontWeight: "900" },
  countdown: { color: colors.text, fontSize: 32, fontWeight: "900", marginTop: 8 },
  button: { backgroundColor: colors.primary, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 24 },
  buttonText: { color: colors.surface, fontWeight: "900" },
  secondary: { padding: 16, alignItems: "center" },
  secondaryText: { color: colors.primary, fontWeight: "800" }
});
