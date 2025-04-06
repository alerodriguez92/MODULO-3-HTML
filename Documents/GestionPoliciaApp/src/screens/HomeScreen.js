import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AdminContext } from "../../App"; // Ajustá el path si hace falta

export default function HomeScreen() {
  const navigation = useNavigation();
  const { esAdmin, setEsAdmin } = useContext(AdminContext);
  const [tapCount, setTapCount] = useState(0);

  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setEsAdmin(true);
      setTapCount(0);
      alert("🟢 Modo administrador activado");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSecretTap}>
        <Text style={styles.title}>👋 Bienvenido</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>¿Qué deseas hacer?</Text>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Recursos Diarios")}>
          <Text style={styles.cardText}>📋 Recursos Diarios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Móviles en Servicio")}>
          <Text style={styles.cardText}>🚔 Gestión de Móviles</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Observaciones y Reportes")}>
          <Text style={styles.cardText}>📝 Observaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.modificarCard]} onPress={() => navigation.navigate("Modificar Capital Diario")}>
          <Text style={styles.cardText}>✏️ Modificar Capital Diario</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#f4f4f4" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 20 },
  cardsContainer: { width: "100%" },
  card: {
    backgroundColor: "#007bff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  modificarCard: {
    backgroundColor: "#ffcc00", // Color especial para distinguir la tarjeta de modificación
  },
  cardText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

