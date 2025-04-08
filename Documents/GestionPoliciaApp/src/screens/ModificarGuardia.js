// ModificarGuardia.js
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
} from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/config";

export default function ModificarGuardia({ volver }) {
  const [dependencia, setDependencia] = useState("");
  const [superiorJerarquia, setSuperiorJerarquia] = useState("");
  const [superiorNombre, setSuperiorNombre] = useState("");
  const [cantidadEfectivos, setCantidadEfectivos] = useState("");
  const [policias, setPolicias] = useState([]);
  const [jerarquia, setJerarquia] = useState("");
  const [nombre, setNombre] = useState("");
  const [horario, setHorario] = useState("");
  const [tieneReduccion, setTieneReduccion] = useState(false);
  const [tieneLactancia, setTieneLactancia] = useState(false);
  const [horarioReduccion, setHorarioReduccion] = useState("");
  const [horarioLactancia, setHorarioLactancia] = useState("");
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === "web") {
      alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const agregarPolicia = () => {
    if (!jerarquia || !nombre || !horario) {
      mostrarAlerta("Faltan datos", "Debés completar jerarquía, nombre y horario");
      return;
    }

    const nuevo = {
      orden: editandoIndex !== null ? policias[editandoIndex].orden : policias.length + 1,
      jerarquia: jerarquia.toUpperCase(),
      nombre: nombre.toUpperCase(),
      horario,
      reduccionHoraria: tieneReduccion,
      horaLactancia: tieneLactancia,
      horarioReduccion,
      horarioLactancia,
    };

    if (editandoIndex !== null) {
      const nuevos = [...policias];
      nuevos[editandoIndex] = nuevo;
      setPolicias(nuevos);
      setEditandoIndex(null);
    } else {
      setPolicias([...policias, nuevo]);
    }

    setJerarquia("");
    setNombre("");
    setHorario("");
    setTieneReduccion(false);
    setTieneLactancia(false);
    setHorarioReduccion("");
    setHorarioLactancia("");
  };

  const eliminarPolicia = (index) => {
    const nuevos = policias.filter((_, i) => i !== index).map((p, i) => ({ ...p, orden: i + 1 }));
    setPolicias(nuevos);
  };

  const guardar = async () => {
    if (
      !dependencia ||
      !superiorJerarquia ||
      !superiorNombre ||
      !cantidadEfectivos ||
      policias.length !== parseInt(cantidadEfectivos)
    ) {
      mostrarAlerta("Error", "Debés completar todos los campos y que la cantidad de efectivos coincida.");
      return;
    }

    setGuardando(true);
    try {
      const usuario = getAuth().currentUser?.email || "anónimo";
      await addDoc(collection(db, "modificaciones"), {
        modificado: true,
        tipo: "guardia",
        fecha: new Date().toISOString(),
        usuario,
        dependencia,
        cantidadEfectivos,
        superior: {
          jerarquia: superiorJerarquia,
          nombre: superiorNombre,
        },
        efectivos: policias,
      });

      setDependencia("");
      setSuperiorJerarquia("");
      setSuperiorNombre("");
      setCantidadEfectivos("");
      setPolicias([]);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch (e) {
      mostrarAlerta("Error", "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.scrollContainer}>
        <TouchableOpacity onPress={volver} style={styles.volverBtn}>
          <Text style={styles.volverText}>⬅️ Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>👮 MODIFICAR PERSONAL TURNO DE GUARDIA</Text>

        <Text style={styles.sectionTitle}>🏢 Dependencia</Text>
        <TextInput style={styles.input} value={dependencia} onChangeText={setDependencia} />

        <Text style={styles.sectionTitle}>⭐ Superior en Turno</Text>
        <TextInput style={styles.input} placeholder="Jerarquía" value={superiorJerarquia} onChangeText={setSuperiorJerarquia} />
        <TextInput style={styles.input} placeholder="Apellido y Nombre" value={superiorNombre} onChangeText={setSuperiorNombre} />

        <Text style={styles.sectionTitle}>👥 Cantidad de Efectivos de Guardia</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Ingrese la cantidad en forma numérica"
          value={cantidadEfectivos}
          onChangeText={(text) => setCantidadEfectivos(text.replace(/[^0-9]/g, ""))}
        />

        <Text style={styles.sectionTitle}>➕ Agregar Policía</Text>
        <TextInput style={styles.input} placeholder="Indique Jerarquía. Ej: Of. Ayudante P.P" value={jerarquia} onChangeText={setJerarquia} />
        <TextInput style={styles.input} placeholder="Indique Apellido y Nombre del efectivo" value={nombre} onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="Indique horario laboral del efectivo" value={horario} onChangeText={setHorario} />

        <View style={styles.sombreadoSwitch}>
          <View style={styles.switchRow}>
            <Text style={{ fontWeight: "bold" }}>Reducción Horaria</Text>
            <Switch value={tieneReduccion} onValueChange={setTieneReduccion} />
          </View>
          {tieneReduccion && (
            <TextInput
              style={styles.input}
              placeholder="Horario reducción. Ej: 08 a 12"
              value={horarioReduccion}
              onChangeText={setHorarioReduccion}
            />
          )}

          <View style={styles.switchRow}>
            <Text style={{ fontWeight: "bold" }}>Hora de Lactancia</Text>
            <Switch value={tieneLactancia} onValueChange={setTieneLactancia} />
          </View>
          {tieneLactancia && (
            <TextInput
              style={styles.input}
              placeholder="Horario lactancia. Ej: 08 a 12"
              value={horarioLactancia}
              onChangeText={setHorarioLactancia}
            />
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={agregarPolicia}>
          <Text style={styles.addButtonText}>
            {editandoIndex !== null ? "Actualizar Policía" : "Agregar Policía"}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={policias}
          keyExtractor={(_, i) => i.toString()}
          ListHeaderComponent={() => (
            <View style={styles.tableRowHeader}>
              <Text style={[styles.cellHeader, { flex: 1 }]}>#</Text>
              <Text style={[styles.cellHeader, { flex: 2 }]}>Jerarquía</Text>
              <Text style={[styles.cellHeader, { flex: 3 }]}>Nombre</Text>
              <Text style={[styles.cellHeader, { flex: 2 }]}>Horario</Text>
              <Text style={[styles.cellHeader, { flex: 2 }]}>Reducción</Text>
              <Text style={[styles.cellHeader, { flex: 2 }]}>Lactancia</Text>
              <Text style={[styles.cellHeader, { flex: 2 }]}>Acciones</Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 1 }]}>{item.orden}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.jerarquia}</Text>
              <Text style={[styles.cell, { flex: 3 }]}>{item.nombre}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.horario}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.reduccionHoraria ? item.horarioReduccion : "-"}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.horaLactancia ? item.horarioLactancia : "-"}</Text>
              <View style={{ flex: 2, flexDirection: "row", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => eliminarPolicia(index)} style={styles.actionBtnRed}>
                  <Text style={styles.actionText}>🗑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setJerarquia(item.jerarquia);
                    setNombre(item.nombre);
                    setHorario(item.horario);
                    setTieneReduccion(item.reduccionHoraria);
                    setTieneLactancia(item.horaLactancia);
                    setHorarioReduccion(item.horarioReduccion);
                    setHorarioLactancia(item.horarioLactancia);
                    setEditandoIndex(index);
                  }}
                  style={styles.actionBtnBlue}
                >
                  <Text style={styles.actionText}>✏️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.guardarBtn} onPress={guardar}>
          <Text style={styles.guardarText}>💾 Guardar Datos Ingresados</Text>
        </TouchableOpacity>
      </View>

      {(guardando || guardado) && (
        <View style={styles.spinnerBox}>
          {guardando ? (
            <ActivityIndicator size="large" color="#28a745" />
          ) : (
            <Text style={styles.successText}>✅ Datos guardados con éxito</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  titulo: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  sectionTitle: { fontWeight: "bold", marginTop: 15, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  sombreadoSwitch: {
    backgroundColor: "#eaeaea",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
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
    marginVertical: 10,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  tableRowHeader: { flexDirection: "row", backgroundColor: "#007bff", padding: 10 },
  cellHeader: { fontSize: 13, color: "#fff", fontWeight: "bold", textAlign: "center" },
  tableRow: { flexDirection: "row", backgroundColor: "#f4f4f4", padding: 10 },
  cell: { fontSize: 12, color: "#000", textAlign: "center", fontWeight: "bold" },
  guardarBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  guardarText: { color: "#fff", fontWeight: "bold" },
  volverBtn: { backgroundColor: "#6c757d", padding: 10, borderRadius: 8, marginBottom: 10 },
  volverText: { color: "#fff", textAlign: "center" },
  actionBtnRed: { backgroundColor: "#dc3545", borderRadius: 4, padding: 4, marginRight: 5 },
  actionBtnBlue: { backgroundColor: "#17a2b8", borderRadius: 4, padding: 4 },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
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
  successText: { color: "#28a745", fontWeight: "bold" },
});
