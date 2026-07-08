import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, signInWithGoogle } from "../api/firebase";
import { customerApi as api, serverMessage } from "../api/client";
import { colors } from "../styles/theme";

export default function CustomerLoginScreen({ navigation }) {
  const [email, setEmail] = useState("customer@bookit.test");
  const [password, setPassword] = useState("secret123");

  async function submit() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Ping backend to confirm profile exists
      await api.post("/auth/customer/login");
      navigation.replace("RestaurantsList");
    } catch (error) {
      Alert.alert("Login failed", serverMessage(error) || error.message);
    }
  }

  async function loginWithGoogle() {
    try {
      await signInWithGoogle();
      // Ping backend to confirm profile exists
      await api.post("/auth/customer/login");
      navigation.replace("RestaurantsList");
    } catch (error) {
      // If profile not found, maybe they need to register
      if (error.response && error.response.status === 404) {
        Alert.alert("Profile not found", "Please create an account first.");
        navigation.navigate("CustomerRegister");
      } else {
        Alert.alert("Google Login failed", serverMessage(error) || error.message);
      }
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>BookIt</Text>
      <Text style={styles.title}>Reserve tables across Rourkela</Text>
      <TextInput style={styles.input} autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" />
      
      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      
      <Pressable style={[styles.button, styles.googleButton]} onPress={loginWithGoogle}>
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("CustomerRegister")}>
        <Text style={styles.link}>Create customer account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  brand: { fontSize: 42, fontWeight: "800", color: colors.primary },
  title: { fontSize: 20, color: colors.text, marginBottom: 24 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 999, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: colors.surface, fontWeight: "800" },
  googleButton: { backgroundColor: "#DB4437", marginTop: 12 },
  googleButtonText: { color: "#ffffff", fontWeight: "800" },
  link: { color: colors.primary, textAlign: "center", marginTop: 18, fontWeight: "700" }
});
