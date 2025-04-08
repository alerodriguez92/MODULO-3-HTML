import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { getAuth } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/config";

export default function ModificarSuperior({ volver }) {
  const [dependencia, setDependencia] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [nombre, setNombre] = useState("");
  const [horario, setHorario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const handleGuardar = async () => {
    if (!dependencia.trim() || !jerarquia.trim() || !nombre.trim() || !horario.trim()) {
      mostrarAlerta("Error", "Debés completar todos los campos.");
      return;
    }

    setGuardando(true);
    try {
      const auth = getAuth();
      const usuario = auth.currentUser;

      const registro = {
        fecha: new Date().toISOString(),
        usuario: usuario?.email || "anónimo",
        dependencia: dependencia.toUpperCase(),
        superior: {
          jerarquia: jerarquia.toUpperCase(),
          nombre: nombre.toUpperCase(),
          horario,
        },
        modificado: true,
      };

      await addDoc(collection(db, "modificaciones"), registro);
      setGuardadoExitoso(true);
      setDependencia("");
      setJerarquia("");
      setNombre("");
      setHorario("");
      setTimeout(() => setGuardadoExitoso(false), 2000);
    } catch (error) {
      console.error("Error al guardar:", error);
      mostrarAlerta("Error", "No se pudieron guardar los datos.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <TouchableOpacity onPress={volver} style={styles.volverBtn}>
            <Text style={styles.volverTexto}>⬅️ Volver</Text>
          </TouchableOpacity>

          <Text style={styles.titulo}>⭐ Cambio de Superior en Turno</Text>

          <Text style={styles.aclaracion}>
            ⚠️ Este formulario se debe completar en caso de relevo del superior en turno.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ingrese Dependencia"
            value={dependencia}
            onChangeText={(text) => setDependencia(text.toUpperCase())}
          />
          <TextInput
            style={styles.input}
            placeholder="Indique su Jerarquía. Ej: Of. Principal P.P "
            value={jerarquia}
            onChangeText={(text) => setJerarquia(text.toUpperCase())}
          />
          <TextInput
            style={styles.input}
            placeholder="Indique su Apellido y Nombre"
            value={nombre}
            onChangeText={(text) => setNombre(text.toUpperCase())}
          />
          <TextInput
            style={styles.input}
            placeholder="Horario de Trabajo. Ej: 15 a 23"
            value={horario}
            onChangeText={setHorario}
          />

          <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar} disabled={guardando}>
            <Text style={styles.textoGuardar}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {(guardando || guardadoExitoso) && (
        <View style={styles.spinnerBox}>
          {guardando ? (
            <ActivityIndicator size="large" color="#28a745" />
          ) : (
            <Text style={styles.spinnerText}>✅ Datos guardados con éxito</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    maxWidth: 1000,
    width: "100%",
    alignSelf: "center",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#003366",
  },
  aclaracion: {
    fontStyle: "italic",
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  botonGuardar: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoGuardar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  volverBtn: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  volverTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
  spinnerBox: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderColor: "#28a745",
    borderWidth: 2,
  },
  spinnerText: {
    color: "#28a745",
    fontWeight: "bold",
    marginTop: 6,
    textAlign: "center",
  },
});
