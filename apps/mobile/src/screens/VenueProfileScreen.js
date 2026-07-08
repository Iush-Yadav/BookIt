import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { hostApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

export default function VenueProfileScreen({ route, navigation }) {
  const [venue, setVenue] = useState(route.params.venue);

  async function setBookingStatus(bookingStatus) {
    try {
      const { data } = await api.put("/host/venue/booking-status", { booking_status: bookingStatus });
      setVenue(data.venue);
    } catch (error) {
      Alert.alert("Status update failed", serverMessage(error));
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{venue.name}</Text>
      <Text style={styles.meta}>{venue.address}</Text>
      <View style={styles.photos}>
        {venue.images.map((image) => <View key={image.uri} style={styles.photo}><Text style={styles.photoText}>{image.alt}</Text></View>)}
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{venue.category.replace("_", " ")}</Text>
        <Text style={styles.label}>Cuisines</Text>
        <Text style={styles.value}>{venue.cuisines.join(", ")}</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{venue.phone || "Not supplied by provider"}</Text>
        <Text style={styles.label}>Opening information</Text>
        <Text style={styles.value}>{venue.open_now === null ? "Not supplied by provider" : venue.open_now ? "Open now" : "Closed now"}</Text>
      </View>
      <Pressable style={styles.button} onPress={() => Alert.alert("Correction request", "BookIt operations will review this venue data correction request.")}>
        <Text style={styles.buttonText}>Request Data Correction</Text>
      </Pressable>
      <Pressable
        style={styles.pause}
        onPress={() => setBookingStatus(venue.booking_status === "accepting_requests" ? "paused" : "accepting_requests")}
      >
        <Text style={styles.pauseText}>{venue.booking_status === "accepting_requests" ? "Pause Booking Requests" : "Resume Booking Requests"}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("HostHome")}><Text style={styles.back}>Back</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 56, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 32, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 8 },
  photos: { flexDirection: "row", gap: 10, marginTop: 20 },
  photo: { flex: 1, height: 110, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", padding: 8 },
  photoText: { color: colors.primary, fontSize: 11, fontWeight: "800", textAlign: "center" },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 22, padding: 16, marginTop: 18 },
  label: { color: colors.muted, fontWeight: "800", marginTop: 10 },
  value: { color: colors.text, fontWeight: "800", marginTop: 4 },
  button: { backgroundColor: colors.primary, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 20 },
  buttonText: { color: colors.surface, fontWeight: "900" },
  pause: { borderColor: colors.primary, borderWidth: 1, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 10 },
  pauseText: { color: colors.primary, fontWeight: "900" },
  back: { color: colors.primary, textAlign: "center", marginTop: 18, fontWeight: "900" }
});
