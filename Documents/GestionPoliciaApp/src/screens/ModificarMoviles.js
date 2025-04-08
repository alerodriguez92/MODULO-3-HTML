// ModificarMoviles.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/config";

export default function ModificarMoviles({ volver }) {
  const [dependencia, setDependencia] = useState("");
  const [movil, setMovil] = useState("");
  const [enServicio, setEnServicio] = useState(true);
  const [motivo, setMotivo] = useState("");
  const [movilesCargados, setMovilesCargados] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === "web") {
      alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const agregarMovil = () => {
    if (!movil || (!enServicio && !motivo)) {
      mostrarAlerta("Error", "Completá todos los campos obligatorios.");
      return;
    }

    const nuevoMovil = {
      numero: movil,
      enServicio,
      motivo: enServicio ? "" : motivo.toUpperCase(),
    };

    setMovilesCargados([...movilesCargados, nuevoMovil]);
    setMovil("");
    setMotivo("");
    setEnServicio(true);
  };

  const guardar = async () => {
    if (!dependencia || movilesCargados.length === 0) {
      mostrarAlerta("Error", "Completá la dependencia y al menos un móvil.");
      return;
    }

    setGuardando(true);
    try {
      const usuario = getAuth().currentUser;
      await addDoc(collection(db, "moviles"), {
        dependencia: dependencia.toUpperCase(),
        moviles: movilesCargados,
        usuario: usuario?.email || "anónimo",
        fecha: new Date().toISOString(),
        modificado: true,
      });

      setDependencia("");
      setMovilesCargados([]);
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 2000);
    } catch (e) {
      mostrarAlerta("Error", "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={volver} style={styles.backButton}>
        <Text style={styles.backButtonText}>⬅️ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🚓 Modificar Parque Automotor</Text>

      <Text style={styles.label}>Dependencia</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Comisaría 16"
        value={dependencia}
        onChangeText={setDependencia}
      />

      <Text style={styles.label}>Número de móvil</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 3054"
        keyboardType="numeric"
        value={movil}
        onChangeText={(text) => setMovil(text.replace(/[^0-9]/g, ""))}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>¿Está en servicio?</Text>
        <Switch value={enServicio} onValueChange={setEnServicio} />
      </View>

      {!enServicio && (
        <>
          <Text style={styles.label}>Motivo</Text>
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            multiline
            placeholder="Indique motivo de fuera de servicio. Ej: Problemas en el motor."
            value={motivo}
            onChangeText={(text) => setMotivo(text.toUpperCase())}
          />
        </>
      )}

      <TouchableOpacity style={styles.addButton} onPress={agregarMovil}>
        <Text style={styles.addButtonText}>Agregar Móvil</Text>
      </TouchableOpacity>

      <FlatList
        data={movilesCargados}
        keyExtractor={(_, i) => i.toString()}
        ListHeaderComponent={() =>
          movilesCargados.length > 0 && (
            <View style={styles.tableRowHeader}>
              <Text style={[styles.cell, { flex: 2 }]}>Número</Text>
              <Text style={[styles.cell, { flex: 2 }]}>Estado</Text>
              <Text style={[styles.cell, { flex: 4 }]}>Motivo</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2 }]}>{item.numero}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{item.enServicio ? "EN SERVICIO" : "FUERA DE SERVICIO"}</Text>
            <Text style={[styles.cell, { flex: 4 }]}>{item.motivo || "-"}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.saveButton} onPress={guardar}>
        <Text style={styles.saveButtonText}>💾 Guardar</Text>
      </TouchableOpacity>

      {(guardando || guardadoExitoso) && (
        <View style={styles.spinnerBox}>
          {guardando ? (
            <ActivityIndicator size="large" color="#28a745" />
          ) : (
            <Text style={styles.successText}>✅ Datos guardados con éxito</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#003366" },
  label: { fontWeight: "bold", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  backButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#007bff", // Igual al botón Guardar
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  cell: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
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
  successText: {
    color: "#28a745",
    fontWeight: "bold",
    marginTop: 5,
  },
});
