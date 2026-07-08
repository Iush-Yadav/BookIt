import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, signInWithGoogle } from "../api/firebase";
import { hostApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

export default function HostRegisterScreen({ navigation }) {
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await api.post("/auth/host/register", { owner_name: ownerName, phone });
      navigation.replace("ClaimVenue");
    } catch (error) {
      Alert.alert("Registration failed", serverMessage(error) || error.message);
    }
  }

  async function registerWithGoogle() {
    try {
      await signInWithGoogle();
      await api.post("/auth/host/register", { owner_name: "", phone: "" });
      navigation.replace("ClaimVenue");
    } catch (error) {
      if (error.response && error.response.status === 409) {
         navigation.replace("ClaimVenue");
      } else {
         Alert.alert("Google Registration failed", serverMessage(error) || error.message);
      }
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Register as Host</Text>
      <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} placeholder="Owner Name" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" />
      <TextInput style={styles.input} autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" />
      
      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.googleButton]} onPress={registerWithGoogle}>
        <Text style={styles.googleButtonText}>Sign up with Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, marginBottom: 20 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: colors.surface, fontWeight: "800" },
  googleButton: { backgroundColor: "#DB4437", marginTop: 12 },
  googleButtonText: { color: "#ffffff", fontWeight: "800" }
});
