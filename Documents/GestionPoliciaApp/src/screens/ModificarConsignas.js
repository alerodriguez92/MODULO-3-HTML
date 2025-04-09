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
import { Ionicons } from "@expo/vector-icons";

export default function ModificarConsignas({ volver }) {
  const [dependencia, setDependencia] = useState("");
  const [cantidadConsignas, setCantidadConsignas] = useState("");
  const [listaConsignas, setListaConsignas] = useState([]);
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [textoTemporal, setTextoTemporal] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const iniciarEdicion = (index) => {
    setTextoTemporal(listaConsignas[index]);
    setEditandoIndex(index);
  };

  const aplicarEdicion = () => {
    const nuevas = [...listaConsignas];
    nuevas[editandoIndex] = textoTemporal.toUpperCase();
    setListaConsignas(nuevas);
    setEditandoIndex(null);
    setTextoTemporal("");
  };

  const eliminarConsigna = (index) => {
    const nuevas = listaConsignas.filter((_, i) => i !== index);
    setListaConsignas(nuevas);
    setCantidadConsignas(nuevas.length.toString());
  };

  const handleGuardar = async () => {
    if (!dependencia.trim()) {
      mostrarAlerta("Error", "Debés completar el campo de dependencia.");
      return;
    }
  
    if (!cantidadConsignas.trim() || listaConsignas.some((c) => !c.trim())) {
      mostrarAlerta("Error", "Completá los domicilios de la cantidad numérica de consignas indicadas.");
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
        // ✅ Guardado con numeración
        consignasCubiertas: listaConsignas.map((c, i) => `${i + 1}. ${c}`).join("\n"),
        modificado: true,
        tipo: "consignas",
      };
  
      await addDoc(collection(db, "modificaciones"), registro);
      setGuardadoExitoso(true);
      setDependencia("");
      setCantidadConsignas("");
      setListaConsignas([]);
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
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.formContainer}>
          <TouchableOpacity onPress={volver} style={styles.volverBtn}>
            <Text style={styles.volverTexto}>⬅️ Volver</Text>
          </TouchableOpacity>

          <Text style={styles.titulo}>📌 Modificación de Consignas</Text>

          <TextInput
            style={styles.input}
            placeholder="Dependencia"
            value={dependencia}
            onChangeText={(text) => setDependencia(text.toUpperCase())}
          />

          <TextInput
            style={styles.input}
            placeholder="Ingrese en forma numérica cantidad de consignas cubiertas actualizada"
            value={cantidadConsignas}
            keyboardType="numeric"
            onChangeText={(text) => {
              const soloNumeros = text.replace(/[^0-9]/g, "");
              setCantidadConsignas(soloNumeros);
              const num = parseInt(soloNumeros) || 0;
              const nuevas = [...listaConsignas];
              while (nuevas.length < num) nuevas.push("");
              if (nuevas.length > num) nuevas.length = num;
              setListaConsignas(nuevas);
            }}
          />

{cantidadConsignas.trim() !== "" && (
  <Text style={styles.resumenCantidad}>
    🔢 Cantidad de consignas: {cantidadConsignas}
  </Text>
)}



          {listaConsignas.map((consigna, index) => (
            <View key={index} style={styles.itemConsigna}>
              {editandoIndex === index ? (
                <>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={textoTemporal}
                    multiline
                    onChangeText={setTextoTemporal}
                  />
                  <TouchableOpacity onPress={aplicarEdicion} style={styles.botonAccionEditar}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
<Text style={{ flex: 1 }}>{index + 1}. {consigna}</Text>


<TouchableOpacity onPress={() => iniciarEdicion(index)} style={styles.botonAccionEditar}>
                    <Ionicons name="pencil" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => eliminarConsigna(index)} style={styles.botonAccionBorrar}>
                    <Ionicons name="trash" size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}

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
  itemConsigna: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    gap: 6,
  },
  botonAccionEditar: {
    backgroundColor: "#17a2b8",
    padding: 6,
    borderRadius: 6,
  },
  botonAccionBorrar: {
    backgroundColor: "#dc3545",
    padding: 6,
    borderRadius: 6,
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
  resumenCantidad: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#003366",
    fontSize: 16,
  },
  
});
