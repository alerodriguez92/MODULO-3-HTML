import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AdminContext } from "../../App";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { esAdmin, setEsAdmin } = useContext(AdminContext);
  const [tapCount, setTapCount] = useState(0);
  const [tooltip, setTooltip] = useState("");
  const [hovered, setHovered] = useState("");

  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setEsAdmin(true);
      setTapCount(0);
      alert("🟢 Modo administrador activado");
    }
  };

  const handleTooltip = (mensaje) => {
    if (Platform.OS === "web") setTooltip(mensaje);
  };

  const clearTooltip = () => {
    if (Platform.OS === "web") setTooltip("");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/fondopoliciamendoza.png")}
      style={styles.background}
      imageStyle={{ resizeMode: "cover" }}
    >
      <View style={styles.overlay}>
        <TouchableOpacity onPress={handleSecretTap}>
          <Text style={styles.title}>👋 Bienvenido</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>¿Qué deseas hacer?</Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.card, hovered === "recursos" && styles.cardHover]}
            onPress={() => navigation.navigate("Recursos Diarios")}
            onMouseEnter={() => setHovered("recursos")}
            onMouseLeave={() => setHovered("")}
          >
            <Text style={styles.cardText}>📋 Capital Diario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, hovered === "moviles" && styles.cardHover]}
            onPress={() => navigation.navigate("Móviles en Servicio")}
            onMouseEnter={() => setHovered("moviles")}
            onMouseLeave={() => setHovered("")}
          >
            <Text style={styles.cardText}>🚔 Gestión de Móviles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.modificarCard, hovered === "modificar" && styles.cardHover]}
            onPress={() => navigation.navigate("Modificar Capital Diario")}
            onMouseEnter={() => {
              setHovered("modificar");
              handleTooltip("📌 Ingresá para modificar recursos, móviles, consignas y cambio de superior");
            }}
            onMouseLeave={() => {
              setHovered("");
              clearTooltip();
            }}
          >
            <Text style={styles.cardText}>✏️ Modificar Datos Cargados</Text>
          </TouchableOpacity>
        </View>

        {tooltip !== "" && (
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipText}>{tooltip}</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 20,
    color: "#eee",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#007bff",
    width: 220,
    height: 220,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    transition: "all 0.3s ease-in-out",
    ...(Platform.OS === "web" && {
      cursor: "pointer",
    }),
  },
  cardHover: {
    transform: [{ scale: 1.08 }],
    backgroundColor: "#0056b3",
  },
  modificarCard: {
    backgroundColor: "#ffcc00",
  },
  cardText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  tooltipContainer: {
    position: "absolute",
    top: 120,
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 10,
    maxWidth: 300,
    zIndex: 10,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
