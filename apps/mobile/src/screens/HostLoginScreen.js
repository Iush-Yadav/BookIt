import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, signInWithGoogle } from "../api/firebase";
import { hostApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

export default function HostLoginScreen({ navigation }) {
  const [email, setEmail] = useState("host@bookit.test");
  const [password, setPassword] = useState("secret123");

  async function submit() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await api.post("/auth/host/login");
      navigation.replace("HostHome");
    } catch (error) {
      Alert.alert("Login failed", serverMessage(error) || error.message);
    }
  }

  async function loginWithGoogle() {
    try {
      await signInWithGoogle();
      await api.post("/auth/host/login");
      navigation.replace("HostHome");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Alert.alert("Profile not found", "Please register your venue first.");
        navigation.navigate("HostRegister");
      } else {
        Alert.alert("Google Login failed", serverMessage(error) || error.message);
      }
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>BookIt for Hosts</Text>
      <Text style={styles.title}>Manage your venue and bookings</Text>
      <TextInput style={styles.input} autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" />
      
      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.googleButton]} onPress={loginWithGoogle}>
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("HostRegister")}>
        <Text style={styles.link}>Register your venue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  brand: { fontSize: 32, fontWeight: "800", color: colors.primary },
  title: { fontSize: 18, color: colors.text, marginBottom: 24 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: colors.surface, fontWeight: "800" },
  googleButton: { backgroundColor: "#DB4437", marginTop: 12 },
  googleButtonText: { color: "#ffffff", fontWeight: "800" },
  link: { color: colors.primary, textAlign: "center", marginTop: 18, fontWeight: "700" }
});
