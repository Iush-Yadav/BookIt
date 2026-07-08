import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../styles/theme";

export default function RoleSelectionScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>BookIt</Text>
      <Text style={styles.title}>Choose your role to continue</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => navigation.navigate("CustomerLogin")}>
          <Text style={styles.buttonText}>I am a Diner</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.hostButton]} onPress={() => navigation.navigate("HostLogin")}>
          <Text style={[styles.buttonText, styles.hostButtonText]}>I am a Restaurant Host</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center", alignItems: "center" },
  brand: { fontSize: 42, fontWeight: "900", color: colors.primary, marginBottom: 8 },
  title: { fontSize: 18, color: colors.muted, marginBottom: 40 },
  buttonContainer: { width: "100%", gap: 16 },
  button: { backgroundColor: colors.primary, borderRadius: 16, padding: 20, alignItems: "center", width: "100%" },
  buttonText: { color: colors.surface, fontWeight: "900", fontSize: 18 },
  hostButton: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary },
  hostButtonText: { color: colors.primary }
});
