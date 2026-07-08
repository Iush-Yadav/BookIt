import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, signInWithGoogle } from "../api/firebase";
import { customerApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

export default function CustomerRegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Sync profile to backend
      await api.post("/auth/customer/register", { name, phone });
      navigation.replace("RestaurantsList");
    } catch (error) {
      Alert.alert("Registration failed", serverMessage(error) || error.message);
    }
  }

  async function registerWithGoogle() {
    try {
      await signInWithGoogle();
      // Sync profile to backend (name will be inferred from Firebase email if not provided)
      await api.post("/auth/customer/register", { name: "", phone: "" });
      navigation.replace("RestaurantsList");
    } catch (error) {
      // If already registered, backend returns 409, which is fine, we can just proceed
      if (error.response && error.response.status === 409) {
         navigation.replace("RestaurantsList");
      } else {
         Alert.alert("Google Registration failed", serverMessage(error) || error.message);
      }
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create account</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
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
