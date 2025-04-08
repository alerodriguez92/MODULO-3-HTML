import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/config";

export default function ModificadosScreen() {
  const [modificados, setModificados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerModificaciones = async () => {
      try {
        const snapshot = await getDocs(collection(db, "modificaciones"));
        const datos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const ordenados = datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setModificados(ordenados);
      } catch (error) {
        console.error("Error al obtener modificaciones:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerModificaciones();
  }, []);

  const renderTitulo = (texto) => (
    <Text style={styles.subtitulo}>{texto}</Text>
  );

  const renderTarjeta = (contenido, index) => (
    <View key={index} style={styles.card}>
      <Text style={styles.fecha}>
        📅 Fecha: {new Date(contenido.fecha).toLocaleString("es-AR", { hour12: false })}
      </Text>
      <Text style={styles.dependencia}>📍 Dependencia: {contenido.dependencia}</Text>

      {contenido.tipo === "guardia" && (
        <>
          <Text>👮 Superior: {contenido.superior.jerarquia} {contenido.superior.nombre}</Text>
          <Text>👥 Cantidad de efectivos: {contenido.cantidadEfectivos}</Text>
          <Text style={styles.section}>📋 Efectivos:</Text>
          {contenido.efectivos?.map((ef, i) => (
            <View key={i} style={{ marginLeft: 10, marginBottom: 6 }}>
              <Text>• {ef.jerarquia} {ef.nombre} ({ef.horario})</Text>
              {ef.reduccionHoraria && <Text style={{ color: "#007bff" }}>🕑 Reducción: {ef.horarioReduccion}</Text>}
              {ef.horaLactancia && <Text style={{ color: "#dc3545" }}>👶 Lactancia: {ef.horarioLactancia}</Text>}
            </View>
          ))}
        </>
      )}

      {contenido.tipo === "consignas" && (
        <>
          <Text style={styles.section}>📌 Consignas Cubiertas:</Text>
          {contenido.consignasCubiertas?.split("\n").map((linea, idx) => (
            <Text key={idx} style={{ marginLeft: 10 }}>• {linea}</Text>
          ))}
        </>
      )}

      {contenido.tipo === "moviles" && (
        <>
          <Text style={styles.section}>✅ Móviles en Servicio:</Text>
          {contenido.moviles?.filter(m => m.enServicio).map((m, i) => (
            <Text key={i} style={{ marginLeft: 10 }}>• Móvil {m.numero}</Text>
          ))}

          <Text style={styles.section}>❌ Fuera de Servicio:</Text>
          {contenido.moviles?.filter(m => !m.enServicio).map((m, i) => (
            <View key={i} style={{ marginLeft: 10 }}>
              <Text>• Móvil {m.numero}</Text>
              <Text style={{ color: "#dc3545", fontWeight: "bold" }}>📝 Motivo: {m.motivo}</Text>
            </View>
          ))}
        </>
      )}

      {contenido.tipo === "superior" && (
        <>
          <Text style={styles.section}>👮 Cambio de Superior en Turno</Text>
          <Text>Jerarquía: {contenido.superior?.jerarquia}</Text>
          <Text>Nombre: {contenido.superior?.nombre}</Text>
          <Text>Horario: {contenido.superior?.horario}</Text>
        </>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📋 REGISTROS MODIFICADOS</Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <>
          {renderTitulo("🟦 MODIFICADOS - CAPITAL DIARIO")}
          {modificados.filter((m) => m.tipo === "guardia").map(renderTarjeta)}

          {renderTitulo("🟨 MODIFICADOS - CONSIGNAS")}
          {modificados.filter((m) => m.tipo === "consignas").map(renderTarjeta)}

          {renderTitulo("🟥 MODIFICADOS - MÓVILES")}
          {modificados.filter((m) => m.tipo === "moviles").map(renderTarjeta)}

          {renderTitulo("🟩 MODIFICADOS - SUPERIOR EN TURNO")}
          {modificados.filter((m) => m.tipo === "superior").map(renderTarjeta)}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4", padding: 20 },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#003366",
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#003366",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  card: {
    backgroundColor: "#fffbe6",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderColor: "#ffc107",
    borderWidth: 2,
  },
  fecha: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  dependencia: {
    fontSize: 14,
    marginBottom: 4,
  },
  section: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },
});
