import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebaseConfig"; // Ensure correct import path
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Expo Router navigation

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully!");
      router.replace("/"); // Redirect to Home after login
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code)); // Improved error handling
    }
  };

  // Function to handle Firebase error messages
  const getFirebaseErrorMessage = (errorCode: string) => {
    const errors: { [key: string]: string } = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Try again.",
      "auth/invalid-email": "Invalid email format.",
      "auth/network-request-failed": "Network error. Check your connection.",
    };
    return errors[errorCode] || "Something went wrong. Please try again.";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className={"text-white"}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className={"text-white"}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={() => router.push("/signup")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
});

export default LoginScreen;
