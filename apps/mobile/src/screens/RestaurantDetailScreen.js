import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { customerApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

const types = [
  ["table_random", "Any Table"],
  ["table_specific", "Pick My Table"],
  ["gathering", "Gathering"],
  ["banquet_hall", "Banquet / Large Space"]
];

export default function RestaurantDetailScreen({ route, navigation }) {
  const [venue, setVenue] = useState(null);
  const [layout, setLayout] = useState(null);
  const [bookingType, setBookingType] = useState("table_random");
  const [partySize, setPartySize] = useState("2");
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState("19:30");
  const [tableId, setTableId] = useState(null);
  const [specialRequest, setSpecialRequest] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const venueResult = await api.get(`/venues/${route.params.venueId}`);
        const layoutResult = await api.get(`/venues/${route.params.venueId}/layout`);
        setVenue(venueResult.data.venue);
        setLayout(layoutResult.data.layout);
      } catch (error) {
        Alert.alert("Could not load venue", serverMessage(error));
      }
    }
    load();
  }, [route.params.venueId]);

  async function sendRequest() {
    try {
      const startAt = new Date(`${date}T${time}:00+05:30`).toISOString();
      const { data } = await api.post("/bookings", {
        venue_id: venue.id,
        booking_type: bookingType,
        party_size: Number(partySize),
        start_at: startAt,
        requested_table_id: bookingType === "table_specific" ? tableId : null,
        special_request: specialRequest,
        request_id: `${venue.id}-${Date.now()}`
      }, { headers: { "Idempotency-Key": `${venue.id}-${Date.now()}` } });
      navigation.replace("BookingRequestSubmitted", { booking: data.booking });
    } catch (error) {
      Alert.alert("Request failed", serverMessage(error));
    }
  }

  if (!venue) return <View style={styles.screen}><Text style={styles.loading}>Loading...</Text></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FlatList
        horizontal
        data={venue.images}
        keyExtractor={(item) => item.uri}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <View style={styles.hero}><Text style={styles.heroText}>{item.alt}</Text></View>}
      />
      <Text style={styles.name}>{venue.name}</Text>
      <Text style={styles.meta}>{venue.category.replace("_", " ")} • {venue.address}</Text>
      <Text style={styles.desc}>{venue.description}</Text>
      <Text style={styles.section}>Booking type</Text>
      <View style={styles.rowWrap}>{types.map(([value, label]) => (
        <Pressable key={value} style={[styles.pill, bookingType === value && styles.pillActive]} onPress={() => setBookingType(value)}>
          <Text style={[styles.pillText, bookingType === value && styles.pillTextActive]}>{label}</Text>
        </Pressable>
      ))}</View>
      <Text style={styles.section}>Party, date, and time</Text>
      <View style={styles.formRow}>
        <TextInput style={styles.inputSmall} keyboardType="number-pad" value={partySize} onChangeText={setPartySize} />
        <TextInput style={styles.input} value={date} onChangeText={setDate} />
        <TextInput style={styles.inputSmall} value={time} onChangeText={setTime} />
      </View>
      {bookingType === "table_specific" && layout ? (
        <View>
          <Text style={styles.section}>Pick My Table</Text>
          <View style={styles.floor}>{layout.tables.map((table) => (
            <Pressable
              key={table.id}
              style={[styles.table, { left: `${table.pos_x * 82}%`, top: `${table.pos_y * 82}%` }, tableId === table.id && styles.tableSelected]}
              onPress={() => setTableId(table.id)}
            >
              <Text style={[styles.tableText, tableId === table.id && styles.tableTextSelected]}>{table.label}</Text>
              <Text style={[styles.tableSeats, tableId === table.id && styles.tableTextSelected]}>{table.capacity}</Text>
            </Pressable>
          ))}</View>
        </View>
      ) : null}
      <Text style={styles.section}>Special request</Text>
      <TextInput style={styles.note} value={specialRequest} onChangeText={setSpecialRequest} placeholder="Birthday, window preference, quiet area..." />
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Restaurant confirmation required</Text>
        <Text style={styles.summaryMuted}>Booking fee shown by server. No payment is collected in this build.</Text>
      </View>
      <Pressable style={styles.button} onPress={sendRequest}><Text style={styles.buttonText}>Send Booking Request</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 54, paddingBottom: 40 },
  loading: { margin: 40, color: colors.muted },
  hero: { width: 280, height: 210, backgroundColor: colors.primarySoft, borderRadius: 24, marginRight: 12, justifyContent: "center", alignItems: "center", padding: 16 },
  heroText: { color: colors.primary, fontWeight: "900", textAlign: "center" },
  name: { color: colors.text, fontSize: 34, fontWeight: "900", marginTop: 18 },
  meta: { color: colors.muted, marginTop: 6 },
  desc: { color: colors.text, marginTop: 14, lineHeight: 21 },
  section: { fontSize: 18, fontWeight: "900", color: colors.text, marginTop: 24, marginBottom: 10 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { backgroundColor: colors.surface, borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10 },
  pillActive: { backgroundColor: colors.primary },
  pillText: { color: colors.text, fontWeight: "800" },
  pillTextActive: { color: colors.surface },
  formRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12 },
  inputSmall: { width: 78, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12 },
  floor: { height: 320, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 20 },
  table: { position: "absolute", width: 54, height: 54, borderRadius: 16, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  tableSelected: { backgroundColor: colors.primary },
  tableText: { color: colors.text, fontWeight: "900" },
  tableSeats: { color: colors.muted, fontSize: 11 },
  tableTextSelected: { color: colors.surface },
  note: { minHeight: 86, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14 },
  summary: { marginTop: 18, padding: 14, borderRadius: 18, backgroundColor: colors.primarySoft },
  summaryText: { color: colors.primary, fontWeight: "900" },
  summaryMuted: { color: colors.muted, marginTop: 4 },
  button: { backgroundColor: colors.primary, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 18 },
  buttonText: { color: colors.surface, fontWeight: "900" }
});
