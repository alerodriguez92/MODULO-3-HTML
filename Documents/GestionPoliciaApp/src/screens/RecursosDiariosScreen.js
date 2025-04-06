// RecursosDiariosScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ScrollView, Alert, StyleSheet, Switch, ActivityIndicator
} from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Platform } from "react-native";


export default function RecursosDiariosScreen() {
  const [dependencia, setDependencia] = useState("");
  const [cantidadEfectivos, setCantidadEfectivos] = useState("");
  const [policias, setPolicias] = useState([]);
  const [nombrePolicia, setNombrePolicia] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [horarioPolicia, setHorarioPolicia] = useState("");
  const [superiorJerarquia, setSuperiorJerarquia] = useState("");
  const [superiorNombre, setSuperiorNombre] = useState("");
  const [superiorHorario, setSuperiorHorario] = useState("");
  const [tieneReduccion, setTieneReduccion] = useState(false);
  const [tieneLactancia, setTieneLactancia] = useState(false);
  const [horarioReduccion, setHorarioReduccion] = useState("");
  const [horarioLactancia, setHorarioLactancia] = useState("");
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [cantidadConsignas, setCantidadConsignas] = useState("");
  const [listaConsignas, setListaConsignas] = useState([]);


  const db = getFirestore();
  const auth = getAuth();

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };
  
  const agregarPolicia = () => {
    if (!jerarquia || !nombrePolicia || !horarioPolicia) {
      mostrarAlerta("Datos incompletos", "Completá jerarquía, nombre y horario del efectivo.");
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

  const eliminarPolicia = (index) => {
    const nuevos = policias.filter((_, i) => i !== index).map((p, i) => ({ ...p, orden: i + 1 }));
    setPolicias(nuevos);
  };

  const guardarTodoEnFirebase = async () => {
    if (
      !dependencia.trim() ||
      !superiorJerarquia.trim() ||
      !superiorNombre.trim() ||
      !superiorHorario.trim() ||
      !cantidadEfectivos.trim()
    ) {
      mostrarAlerta("Error", "Llenar todos los campos antes de guardar, de arriba hacia abajo.");
      return;
    }
    if (listaConsignas.some((c) => !c.trim())) {
      mostrarAlerta("Error", "Debe completar todas las consignas indicadas.");
      return;
    }
    

    const cantidad = parseInt(cantidadEfectivos);
    if (isNaN(cantidad) || policias.length !== cantidad) {
      mostrarAlerta("Error", `Debés agregar exactamente ${cantidadEfectivos} policías antes de guardar.`);
      return;
    }

    setGuardando(true);
    try {
      const usuario = auth.currentUser;
      const registro = {
        fecha: new Date().toISOString(),
        usuario: usuario?.email || "anónimo",
        dependencia: dependencia.toUpperCase(),
        superior: {
          jerarquia: superiorJerarquia.toUpperCase(),
          nombre: superiorNombre.toUpperCase(),
          horario: superiorHorario,
        },
        cantidadEfectivos,
        efectivos: policias,
        consignasCubiertas: listaConsignas.join("\n")
      };

      await addDoc(collection(db, "recursos"), registro);
      setGuardadoExitoso(true);

      setDependencia("");
      setCantidadEfectivos("");
      setPolicias([]);
      setSuperiorJerarquia("");
      setSuperiorNombre("");
      setSuperiorHorario("");

      setTimeout(() => setGuardadoExitoso(false), 2000);
    } catch (error) {
      console.error("Error al guardar:", error);
      mostrarAlerta("Error", "No se pudieron guardar los datos.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>📋 Recursos Diarios</Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🏢 Dependencia</Text>
          <TextInput style={styles.input} placeholder="Ej: Comisaría 16" value={dependencia} onChangeText={(text) => setDependencia(text.toUpperCase())} />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>⭐ Superior en Turno</Text>
          <TextInput style={styles.input} placeholder="Jerarquía" value={superiorJerarquia} onChangeText={(text) => setSuperiorJerarquia(text.toUpperCase())} />
          <TextInput style={styles.input} placeholder="Apellido y Nombre" value={superiorNombre} onChangeText={(text) => setSuperiorNombre(text.toUpperCase())} />
          <TextInput style={styles.input} placeholder="Horario de Trabajo. Ej: 07 a 15" value={superiorHorario} onChangeText={setSuperiorHorario} />
        </View>
        <View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>📌 Consignas Cubiertas</Text>
  <TextInput
    style={styles.input}
    placeholder="Indique en forma numerica Ej: 1 o 2 o 3 Cantidad de consignas cubiertas, y luego se habilitara para  completar con los domicilios en la seccion que va aparecer abajo "
    keyboardType="numeric"
    value={cantidadConsignas}
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
  {listaConsignas.map((consigna, index) => (
    <TextInput
      key={index}
      style={[styles.input, { minHeight: 60 }]}
      multiline
      placeholder={`Consigna ${index + 1}`}
      value={consigna}
      onChangeText={(text) => {
        const nuevas = [...listaConsignas];
        nuevas[index] = text.toUpperCase();
        setListaConsignas(nuevas);
      }}
    />
  ))}
</View>


        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>👥 Cantidad de Efectivos de Guardia</Text>
          <TextInput
  style={styles.input}
  keyboardType="numeric"
  value={cantidadEfectivos}
  onChangeText={(text) => {
    const soloNumeros = text.replace(/[^0-9]/g, ""); // elimina todo lo que no sea número
    setCantidadEfectivos(soloNumeros);
  }}
  placeholder="Ingrese cantidad de Efectivos en el Turno de Guardia"
/>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🚔 Agregar Policía</Text>
          <TextInput style={styles.input} placeholder="Jerarquía" value={jerarquia} onChangeText={(text) => setJerarquia(text.toUpperCase())} />
          <TextInput style={styles.input} placeholder="Apellido y Nombre" value={nombrePolicia} onChangeText={(text) => setNombrePolicia(text.toUpperCase())} />
          <TextInput style={styles.input} placeholder="Horario Laboral. Ej: 12 x 24 y 12 x 48" value={horarioPolicia} onChangeText={setHorarioPolicia} />

          <View style={styles.switchRow}>
            <Text style={styles.reduccionTitulo}>Reducción Horaria</Text>
            <Switch value={tieneReduccion} onValueChange={setTieneReduccion} />
          </View>
          {tieneReduccion && <TextInput style={styles.input} placeholder="Indique Horario de reduccion horaria. Ej: 08 a 12" value={horarioReduccion} onChangeText={setHorarioReduccion} />}

          <View style={styles.switchRow}>
            <Text style={styles.reduccionTitulo}>Hora de Lactancia</Text>
            <Switch value={tieneLactancia} onValueChange={setTieneLactancia} />
          </View>
          {tieneLactancia && <TextInput style={styles.input} placeholder="Inidique Horario de Lactancia. Ej: 08 a 12" value={horarioLactancia} onChangeText={setHorarioLactancia} />}

          <TouchableOpacity style={styles.addButton} onPress={agregarPolicia}>
            <Text style={styles.addButtonText}>Presione aquí para ingresar uno por uno los efectivos que conforman el turno</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={policias}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={() => (
            <View style={styles.tableRowHeader}>
              <Text style={[styles.headerCell, { flex: 1 }]}>#</Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>Jerarquía</Text>
              <Text style={[styles.headerCell, { flex: 3 }]}>Nombre</Text>
              <Text style={[styles.headerCell, { flex: 3 }]}>Horario</Text>
              <Text style={[styles.headerCell, { flex: 3 }]}>Reducción</Text>
              <Text style={[styles.headerCell, { flex: 3 }]}>Lactancia</Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>Acción</Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <View style={styles.tableRowBody}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{index + 1}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.jerarquia}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.nombre}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.horario}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.reduccionHoraria ? item.horarioReduccion : "-"}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.horaLactancia ? item.horarioLactancia : "-"}</Text>
              <View style={{ flex: 2, flexDirection: "row", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => eliminarPolicia(index)} style={styles.actionBtnRed}>
                  <Text style={styles.actionText}>🗑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setNombrePolicia(item.nombre);
                    setJerarquia(item.jerarquia);
                    setHorarioPolicia(item.horario);
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

        <TouchableOpacity style={[styles.addButton, guardando && { backgroundColor: "#aaa" }]} onPress={guardarTodoEnFirebase} disabled={guardando}>
        <Text style={[styles.addButtonText, { textAlign: "center" }]}>
  PRESIONE AQUI PARA GUARDAR TODOS LOS DATOS{"\n"}(UNA VEZ LLENADO TODOS LOS FORMULARIOS)
</Text>


        </TouchableOpacity>
      </ScrollView>

      {(guardando || guardadoExitoso) && (
        <View style={styles.loadingOverlay}>
          <View style={{ backgroundColor: "#28a745", padding: 20, borderRadius: 10 }}>
            {guardando && <ActivityIndicator size="large" color="#fff" />}
            <Text style={styles.loadingText}>
              {guardando ? "Guardando datos..." : "✅ Datos guardados con éxito"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  sectionContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
  addButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 8, alignItems: "center", marginVertical: 15 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  reduccionTitulo: { fontSize: 16, fontWeight: "bold" },
  headerCell: { color: "white", fontWeight: "bold", fontSize: 14, textAlign: "center" },
  tableCell: { fontSize: 14, color: "#333", textAlign: "center" },
  tableRowHeader: { flexDirection: "row", backgroundColor: "#007bff", padding: 10, borderWidth: 1, borderColor: "#000" },
  tableRowBody: { flexDirection: "row", backgroundColor: "#fff", padding: 10, borderWidth: 1, borderColor: "#000", alignItems: "center" },
  actionBtnRed: { backgroundColor: "#dc3545", borderRadius: 4, padding: 4, marginRight: 5 },
  actionBtnBlue: { backgroundColor: "#17a2b8", borderRadius: 4, padding: 4 },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  loadingText: { marginTop: 8, color: "#fff", fontWeight: "bold", textAlign: "center" },
});
