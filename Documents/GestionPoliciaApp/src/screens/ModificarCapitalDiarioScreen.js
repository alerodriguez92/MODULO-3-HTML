import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { collection, addDoc, getFirestore, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ModificarMoviles from "./ModificarMoviles";
import ModificarConsignas from "./ModificarConsignas";
import ModificarGuardia from "./ModificarGuardia";
import ModificarSuperior from "./ModificarSuperior";





const db = getFirestore();
const auth = getAuth();

const OpcionMenu = ({ label, onPress, tooltip }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.menuCard}
    {...(Platform.OS === "web" ? { title: tooltip } : {})}
  >
    <Text style={styles.menuCardText}>{label}</Text>
  </TouchableOpacity>
);

export default function ModificarCapitalDiarioScreen() {
  const [vista, setVista] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const [dependencia, setDependencia] = useState("");
  const [superiorJerarquia, setSuperiorJerarquia] = useState("");
  const [superiorNombre, setSuperiorNombre] = useState("");
  const [superiorHorario, setSuperiorHorario] = useState("");
  const [cantidadConsignas, setCantidadConsignas] = useState("");
  const [listaConsignas, setListaConsignas] = useState([]);

  const [policias, setPolicias] = useState([]);
  const [nombrePolicia, setNombrePolicia] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [horarioPolicia, setHorarioPolicia] = useState("");
  const [tieneReduccion, setTieneReduccion] = useState(false);
  const [tieneLactancia, setTieneLactancia] = useState(false);
  const [horarioReduccion, setHorarioReduccion] = useState("");
  const [horarioLactancia, setHorarioLactancia] = useState("");
  const [editandoIndex, setEditandoIndex] = useState(null);

  const volverMenuPrincipal = () => setVista("");

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      alert(`${titulo}: ${mensaje}`);
    }
  };

  const agregarPolicia = () => {
    if (!jerarquia || !nombrePolicia || !horarioPolicia) {
      mostrarAlerta("Faltan datos", "Jerarquía, nombre y horario del efectivo son obligatorios");
      return;
    }

    const nuevo = {
      orden: policias.length + 1,
      jerarquia: jerarquia.toUpperCase(),
      nombre: nombrePolicia.toUpperCase(),
      horario: horarioPolicia,
      reduccionHoraria: tieneReduccion,
      horaLactancia: tieneLactancia,
      horarioReduccion,
      horarioLactancia,
    };

    if (editandoIndex !== null) {
      const nuevos = [...policias];
      nuevos[editandoIndex] = { ...nuevos[editandoIndex], ...nuevo };
      setPolicias(nuevos);
      setEditandoIndex(null);
    } else {
      setPolicias([...policias, nuevo]);
    }

    setNombrePolicia("");
    setJerarquia("");
    setHorarioPolicia("");
    setTieneReduccion(false);
    setTieneLactancia(false);
    setHorarioReduccion("");
    setHorarioLactancia("");
  };

  const guardarFormulario = async (tipo) => {
    setGuardando(true);
    try {
      const usuario = auth.currentUser;
      const baseData = {
        fecha: Timestamp.now(),
        dependencia: dependencia.toUpperCase(),
        usuario: usuario?.email || "anónimo",
        modificado: true,
        tipoModificacion: tipo,
      };

      if (tipo === "guardia") {
        await addDoc(collection(db, "modificaciones"), {
          ...baseData,
          superior: {
            jerarquia: superiorJerarquia.toUpperCase(),
            nombre: superiorNombre.toUpperCase(),
            horario: superiorHorario,
          },
          efectivos: policias,
        });
      } else if (tipo === "consignas") {
        await addDoc(collection(db, "modificaciones"), {
          ...baseData,
          consignasCubiertas: listaConsignas.join("\n"),
        });
      } else if (tipo === "superior") {
        await addDoc(collection(db, "modificaciones"), {
          ...baseData,
          superior: {
            jerarquia: superiorJerarquia.toUpperCase(),
            nombre: superiorNombre.toUpperCase(),
            horario: superiorHorario,
          },
        });
      }

      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 2000);
    } catch (e) {
      console.error("Error al guardar:", e);
      mostrarAlerta("Error", "No se pudo guardar la modificación.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {vista === "" && (
          <>
            <Text style={styles.title}>✏️ Modificaciones</Text>
            <View style={styles.menuGrid}>
              <OpcionMenu label="👮 Personal Turno de Guardia" tooltip="Editar policías" onPress={() => setVista("guardia")} />
              <OpcionMenu label="🚓 Parque Automotor" tooltip="Editar móviles" onPress={() => setVista("moviles")} />
              <OpcionMenu label="📌 Consignas" tooltip="Editar consignas" onPress={() => setVista("consignas")} />
              <OpcionMenu label="⭐ Superior en Turno" tooltip="Editar datos del superior" onPress={() => setVista("superior")} />
            </View>
          </>
        )}
{vista === "moviles" && (
  <ModificarMoviles volver={volverMenuPrincipal} />
)}


{vista === "guardia" && (
  <ModificarGuardia volver={volverMenuPrincipal} />
)}


{vista === "consignas" && (
  <ModificarConsignas volver={volverMenuPrincipal} />
)}

{vista === "superior" && (
  <ModificarSuperior volver={volverMenuPrincipal} />
)}

      </ScrollView>

      {(guardando || guardadoExitoso) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>
            {guardando ? "Guardando datos..." : "✅ Datos guardados con éxito"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#003366" },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 15 },
  menuCard: {
    backgroundColor: "#007bff",
    width: 160,
    height: 160,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    ...(Platform.OS === "web" && { cursor: "pointer" }),
  },
  menuCardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
    color: "#003366",
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: 100,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: "40%",
    left: "20%",
    right: "20%",
    backgroundColor: "#28a745",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
});