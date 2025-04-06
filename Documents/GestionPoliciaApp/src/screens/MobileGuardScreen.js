import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Platform, // solo una vez
} from "react-native";

import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/config";



export default function MobileGuardScreen() {
  const [numeroMovil, setNumeroMovil] = useState("");
  const [esServicio, setEsServicio] = useState(true);
  const [motivoFueraServicio, setMotivoFueraServicio] = useState("");
  const [esPrestamo, setEsPrestamo] = useState(false);
  const [dependenciaDestino, setDependenciaDestino] = useState("");
  const [moviles, setMoviles] = useState([]);

  const [mostrarSeccionPrestamo, setMostrarSeccionPrestamo] = useState(false);
  const [mostrarSeccionMotos, setMostrarSeccionMotos] = useState(false);

  const [motos, setMotos] = useState([]);
  const [tieneMotos, setTieneMotos] = useState(false);
  const [numeroMoto, setNumeroMoto] = useState("");
  const [motoEnServicio, setMotoEnServicio] = useState(true);
  const [motivoMoto, setMotivoMoto] = useState("");

  const [dependencia, setDependencia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === "web") {
      alert(`${titulo}\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const agregarMovil = () => {
    if (!numeroMovil.trim()) {
      mostrarAlerta("Error", "Ingresá el número de móvil.");
      return;
    }

    if (!esServicio && !motivoFueraServicio.trim()) {
      mostrarAlerta("Error", "Ingresá el motivo del móvil fuera de servicio.");
      return;
    }

    if (esPrestamo && !dependenciaDestino.trim()) {
      mostrarAlerta("Error", "Ingresá la dependencia destino.");
      return;
    }

    setMoviles([
      ...moviles,
      {
        id: Date.now().toString(),
        numero: numeroMovil,
        enServicio: esServicio,
        prestamo: esPrestamo,
        destino: esPrestamo ? dependenciaDestino.toUpperCase() : "",
        motivo: !esServicio ? motivoFueraServicio.toUpperCase() : "",
      },
    ]);

    setNumeroMovil("");
    setEsServicio(true);
    setMotivoFueraServicio("");
    setEsPrestamo(false);
    setDependenciaDestino("");
  };

  const agregarMoto = () => {
    if (!numeroMoto.trim()) {
      mostrarAlerta("Error", "Ingresá el número de moto.");
      return;
    }

    if (!motoEnServicio && !motivoMoto.trim()) {
      mostrarAlerta("Error", "Ingresá el motivo de la moto fuera de servicio.");
      return;
    }

    setMotos([
      ...motos,
      {
        id: Date.now().toString(),
        numero: numeroMoto,
        enServicio: motoEnServicio,
        motivo: !motoEnServicio ? motivoMoto.toUpperCase() : "",
      },
    ]);

    setNumeroMoto("");
    setMotoEnServicio(true);
    setMotivoMoto("");
  };

  const guardarEnFirebase = async () => {
    if (!dependencia.trim()) {
      mostrarAlerta("Error", "Ingresá la dependencia.");
      return;
    }
    if (moviles.length === 0) {
      mostrarAlerta("Error", "Agregá al menos un móvil antes de guardar.");
      return;
    }
  
    setGuardando(true);
  
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      await addDoc(collection(db, "moviles"), {
        fecha: new Date().toISOString(),
        usuario: user?.email || "anónimo",
        dependencia: dependencia.toUpperCase(),
        moviles,
        motos,
      });
  
      setGuardadoExitoso(true);
      setMoviles([]);
      setMotos([]);
      setDependencia("");
  
      setTimeout(() => setGuardadoExitoso(false), 2000);
    } catch (error) {
      console.error("Error al guardar:", error);
      mostrarAlerta("Error", "No se pudieron guardar los datos.");
    } finally {
      setGuardando(false);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>🚓 Gestión de Móviles</Text>

      <TextInput
        style={styles.input}
        placeholder="Dependencia"
        value={dependencia}
        onChangeText={(text) => setDependencia(text.toUpperCase())}
      />

      <Text style={styles.seccionTitulo}>MÓVILES</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de móvil"
        keyboardType="numeric"
        value={numeroMovil}
        onChangeText={(text) => setNumeroMovil(text.replace(/[^0-9]/g, ""))}
      />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>¿En Servicio?</Text>
        <Switch
          value={esServicio}
          onValueChange={(valor) => {
            setEsServicio(valor);
            if (valor) setMotivoFueraServicio("");
          }}
        />
      </View>
      {!esServicio && (
        <TextInput
          style={styles.input}
          placeholder="Motivo fuera de servicio"
          value={motivoFueraServicio}
          onChangeText={(text) => setMotivoFueraServicio(text.toUpperCase())}
        />
      )}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>¿A Préstamo?</Text>
        <Switch
          value={esPrestamo}
          onValueChange={(valor) => {
            setEsPrestamo(valor);
            if (!valor) setDependenciaDestino("");
          }}
        />
      </View>
      {esPrestamo && (
        <TextInput
          style={styles.input}
          placeholder="Dependencia destino"
          value={dependenciaDestino}
          onChangeText={(text) => setDependenciaDestino(text.toUpperCase())}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={agregarMovil}>
        <Text style={styles.buttonText}>Agregar Móvil</Text>
      </TouchableOpacity>

      {moviles.map((movil, index) => (
        <Text key={index} style={styles.movilText}>
          • Móvil {movil.numero}{" "}
          {movil.prestamo
            ? `(PRÉSTAMO a ${movil.destino})`
            : movil.enServicio
            ? "(EN SERVICIO)"
            : `(FUERA SERVICIO - ${movil.motivo})`}
        </Text>
      ))}

      <Text style={styles.seccionTitulo}>MOTOS</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>¿Posee motos?</Text>
        <Switch
          value={mostrarSeccionMotos}
          onValueChange={(valor) => setMostrarSeccionMotos(valor)}
        />
      </View>

      {mostrarSeccionMotos && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Número de moto"
            keyboardType="numeric"
            value={numeroMoto}
            onChangeText={(text) => setNumeroMoto(text.replace(/[^0-9]/g, ""))}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>¿En Servicio?</Text>
            <Switch
              value={motoEnServicio}
              onValueChange={(valor) => {
                setMotoEnServicio(valor);
                if (valor) setMotivoMoto("");
              }}
            />
          </View>
          {!motoEnServicio && (
            <TextInput
              style={styles.input}
              placeholder="Motivo fuera de servicio"
              value={motivoMoto}
              onChangeText={(text) => setMotivoMoto(text.toUpperCase())}
            />
          )}
          <TouchableOpacity style={styles.button} onPress={agregarMoto}>
            <Text style={styles.buttonText}>Agregar Moto</Text>
          </TouchableOpacity>
        </>
      )}

      {motos.map((moto, index) => (
        <Text key={index} style={styles.movilText}>
          • Moto {moto.numero}{" "}
          {moto.enServicio
            ? "(EN SERVICIO)"
            : `(FUERA SERVICIO - ${moto.motivo})`}
        </Text>
      ))}

      {guardando || guardadoExitoso ? (
        <View style={styles.loadingOverlay}>
          {guardando && <ActivityIndicator size="large" color="#fff" />}
          <Text style={styles.loadingText}>
            {guardando ? "Guardando datos..." : "✅ Datos guardados con éxito"}
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={guardarEnFirebase}>
          <Text style={styles.buttonText}>Guardar todo</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  switchLabel: { fontSize: 16, fontWeight: "bold" },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  movilText: {
    backgroundColor: "#e9ecef",
    padding: 8,
    borderRadius: 5,
    marginVertical: 4,
    fontSize: 16,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    color: "#003366",
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -40 }],
    width: 220,
    height: 90,
    backgroundColor: "#28a745",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },
  loadingText: { marginTop: 8, color: "#fff", fontWeight: "bold" },
});
