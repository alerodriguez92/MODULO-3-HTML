import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/config";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ConsultaRecursosScreen() {
  const [registros, setRegistros] = useState([]);
  const [moviles, setMoviles] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroDependencia, setFiltroDependencia] = useState("");
  const [paginaRecursos, setPaginaRecursos] = useState(1);
  const [paginaMoviles, setPaginaMoviles] = useState(1);
  const elementosPorPagina = 5;

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const snapshotRecursos = await getDocs(collection(db, "recursos"));
        const recursos = snapshotRecursos.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const snapshotModificados = await getDocs(collection(db, "registros"));
        const registrosModificados = snapshotModificados.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const snapshotMoviles = await getDocs(collection(db, "moviles"));
        const listaMoviles = snapshotMoviles.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const todosLosRegistros = [...recursos, ...registrosModificados];

        setRegistros(
          todosLosRegistros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        );
        setMoviles(
          listaMoviles.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        );
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    obtenerDatos();
  }, []);

  const filtrarDatos = (lista) => {
    return lista.filter((item) => {
      const fechaFormateada = new Date(item.fecha).toLocaleDateString("es-AR"); // DD/MM/YYYY
      const fechaOk = filtroFecha ? fechaFormateada.includes(filtroFecha) : true;
      const depOk = filtroDependencia
        ? item.dependencia?.toLowerCase().includes(filtroDependencia.toLowerCase())
        : true;
      return fechaOk && depOk;
    });
  };

  const recursosFiltrados = filtrarDatos(registros);
  const movilesFiltrados = filtrarDatos(moviles);

  const dataMoviles = movilesFiltrados.map((m) => ({
    Fecha: new Date(m.fecha?.toDate?.() || m.fecha).toLocaleString("es-AR", { hour12: false }),
    Modificado: m.modificado ? "✅ MODIFICADO" : "—",
    Dependencia: m.dependencia,
    "Móviles en Servicio": m.moviles
      ?.filter((mov) => mov.enServicio && !mov.prestamo)
      .map((mov) => `Móvil ${mov.numero}`)
      .join(", ") || "",
    "Móviles Fuera de Servicio": m.moviles
      ?.filter((mov) => !mov.enServicio && !mov.prestamo)
      .map((mov) => `Móvil ${mov.numero} - ${mov.motivo}`)
      .join(", ") || "",
    "Móviles a Préstamo": m.moviles
      ?.filter((mov) => mov.prestamo)
      .map((mov) => `Móvil ${mov.numero} → ${mov.destino}`)
      .join(", ") || "",
    "Motos en Servicio": m.motos
      ?.filter((mt) => mt.enServicio)
      .map((mt) => `Moto ${mt.numero}`)
      .join(", ") || "",
    "Motos Fuera de Servicio": m.motos
      ?.filter((mt) => !mt.enServicio)
      .map((mt) => `Moto ${mt.numero} - ${mt.motivo}`)
      .join(", ") || "",
  }));

  const exportarAExcel = () => {
    const dataRecursos = recursosFiltrados.map((r) => ({
      Fecha: new Date(r.fecha?.toDate?.() || r.fecha).toLocaleString("es-AR", { hour12: false }),
      Modificado: r.modificado ? "✅ MODIFICADO" : "—",
      Dependencia: r.dependencia,
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(dataRecursos);
    const ws2 = XLSX.utils.json_to_sheet(dataMoviles);

    XLSX.utils.book_append_sheet(wb, ws1, "Recursos");
    XLSX.utils.book_append_sheet(wb, ws2, "Móviles");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "consulta_recursos_y_moviles.xlsx");
  };

  const paginar = (datos, pagina) =>
    datos.slice(
      (pagina - 1) * elementosPorPagina,
      pagina * elementosPorPagina
    );

  const totalPaginas = (datos) => Math.ceil(datos.length / elementosPorPagina);

  const renderPaginacion = (paginaActual, setPagina, total) => {
    const botones = [];
    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(total, inicio + 4);

    for (let i = inicio; i <= fin; i++) {
      botones.push(
        <TouchableOpacity
          key={i}
          onPress={() => setPagina(i)}
          style={[
            styles.paginaBtn,
            paginaActual === i && styles.paginaBtnActiva,
          ]}
        >
          <Text style={styles.paginaText}>{i}</Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.paginacion}>{botones}</View>;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Consulta de Recursos</Text>

      <TextInput
        style={styles.input}
        placeholder="Filtrar por fecha (DD/MM/AAAA)"
        value={filtroFecha}
        onChangeText={setFiltroFecha}
      />
      <TextInput
        style={styles.input}
        placeholder="Filtrar por dependencia"
        value={filtroDependencia}
        onChangeText={setFiltroDependencia}
      />

      <TouchableOpacity onPress={exportarAExcel} style={styles.exportButton}>
        <Text style={styles.exportButtonText}>📤 Exportar a Excel</Text>
      </TouchableOpacity>

      {/* 🔹 Recursos Humanos */}
      <FlatList
        data={paginar(recursosFiltrados, paginaRecursos)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.modificado && styles.cardModificado]}>
            {item.modificado && (
              <Text style={styles.etiquetaModificado}>MODIFICADO</Text>
            )}
            <Text style={styles.fecha}>
              📅 Fecha: {new Date(item.fecha).toLocaleString("es-AR", {
                hour12: false,
              })}
            </Text>
            {/* ✅ AGREGÁ ESTO ACÁ */}
      <Text style={styles.dependencia}>
        📍 Dependencia: {item.dependencia}
      </Text>
            {item.superior ? (
              <>
                <Text style={styles.superior}>
                  👮 Superior: {item.superior.jerarquia} {item.superior.nombre}
                </Text>
                <Text style={styles.horario}>
                  🕒 Horario: {item.superior.horario}
                </Text>
              </>
            ) : (
              <Text style={styles.superior}>👮 Superior: No registrado</Text>
            )}

            <Text style={styles.efectivos}>
              👥 Efectivos: {item.cantidadEfectivos}
            </Text>

            <Text style={styles.subtitulo}>📋 Efectivos:</Text>
            {item.efectivos?.map((ef, index) => (
              
              <View key={index} style={{ marginBottom: 8, paddingLeft: 12 }}>
                <Text style={styles.efectivoItem}>
                  {index + 1}. {ef.jerarquia} {ef.nombre} ({ef.horario})
                </Text>
                {ef.reduccionHoraria && (
                  <Text style={{ color: "#007bff", marginLeft: 15 }}>
                    🕑 Reducción: {ef.horarioReduccion}
                  </Text>
                )}
                {ef.horaLactancia && (
                  <Text style={{ color: "#dc3545", marginLeft: 15 }}>
                    👶 Lactancia: {ef.horarioLactancia}
                  </Text>
                )}
              </View>
            ))}
            {/* 👉 AGREGAR ESTO DESPUÉS DEL MAP DE EFECTIVOS */}
{item.consignasCubiertas && (
  <View style={{ marginTop: 10 }}>
    <Text style={[styles.subtitulo, { color: "#003366" }]}>📌 Consignas Cubiertas:</Text>
    {item.consignasCubiertas.split("\n").map((linea, idx) => (
      <Text key={idx} style={{ marginLeft: 10, color: "#333" }}>
        • {linea}
      </Text>
    ))}
  </View>
)}
          </View>
        )}
      />
      {renderPaginacion(
        paginaRecursos,
        setPaginaRecursos,
        totalPaginas(recursosFiltrados)
      )}

      {/* 🔹 Móviles */}
      <Text style={[styles.title, { marginTop: 40 }]}>
        🚔 Consulta de Móviles
      </Text>
      <FlatList
        data={paginar(movilesFiltrados, paginaMoviles)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[styles.card, { borderColor: "#333" }, item.modificado && styles.cardModificado]}
          >
            {item.modificado && (
              <Text style={styles.etiquetaModificado}>MODIFICADO</Text>
            )}

            <Text style={styles.fecha}>
              📅 Fecha: {new Date(item.fecha).toLocaleString("es-AR", {
                hour12: false,
              })}
            </Text>
            <Text style={styles.superior}>
              📍 Dependencia: {item.dependencia}
            </Text>
            <Text style={styles.subtitulo}>✅ En Servicio:</Text>
            {item.moviles
              ?.filter((m) => m.enServicio && !m.prestamo)
              .map((m, i) => (
                <Text key={i} style={styles.efectivoItem}>
                  • Móvil {m.numero}
                </Text>
              ))}

            <Text style={styles.subtitulo}>❌ Fuera de Servicio:</Text>
            {item.moviles
              ?.filter((m) => !m.enServicio && !m.prestamo)
              .map((m, i) => (
                <View key={i} style={{ marginLeft: 10, marginBottom: 6 }}>
                  <Text style={styles.efectivoItem}>• Móvil {m.numero}</Text>
                  {m.motivo && (
                    <Text style={styles.motivoFueraServicio}>
                      📝 Motivo: {m.motivo}
                    </Text>
                  )}
                </View>
              ))}

            <Text style={styles.subtitulo}>🔄 Móviles a Préstamo:</Text>
            {item.moviles
              ?.filter((m) => m.prestamo)
              .map((m, i) => (
                <Text key={i} style={styles.efectivoItem}>
                  • Móvil {m.numero} → {m.destino}
                </Text>
              ))}

            {item.motos && item.motos.length > 0 && (
              <>
                <Text style={styles.subtitulo}>🏍 Motos en Servicio:</Text>
                {item.motos
                  .filter((m) => m.enServicio)
                  .map((m, i) => (
                    <Text key={i} style={styles.efectivoItem}>
                      • Moto {m.numero}
                    </Text>
                  ))}

                <Text style={styles.subtitulo}>🛠 Motos Fuera de Servicio:</Text>
                {item.motos
                  .filter((m) => !m.enServicio)
                  .map((m, i) => (
                    <View key={i} style={{ marginLeft: 10, marginBottom: 6 }}>
                      <Text style={styles.efectivoItem}>• Moto {m.numero}</Text>
                      {m.motivo && (
                        <Text style={styles.motivoFueraServicio}>
                          📝 Motivo: {m.motivo}
                        </Text>
                      )}
                    </View>
                  ))}
              </>
            )}
          </View>
        )}
      />
      {renderPaginacion(
        paginaMoviles,
        setPaginaMoviles,
        totalPaginas(movilesFiltrados)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f4f8" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#003366",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  exportButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  exportButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#007bff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardModificado: {
    borderColor: "#ffc107", // Borde amarillo
    backgroundColor: "#fffbe6", // Fondo suave amarillo claro
    borderWidth: 2,
  },
  etiquetaModificado: {
    backgroundColor: "#ffc107",
    color: "#000",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 13,
  },
  fecha: { fontWeight: "bold", marginBottom: 6, fontSize: 16 },
  superior: { fontSize: 15, marginBottom: 4 },
  horario: { fontSize: 15, marginBottom: 4 },
  efectivos: { fontSize: 15, marginBottom: 8 },
  subtitulo: { fontWeight: "bold", marginTop: 10, marginBottom: 4 },
  efectivoItem: { fontSize: 14, marginLeft: 10, color: "#333" },
  paginacion: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    flexWrap: "wrap",
    gap: 5,
  },
  paginaBtn: {
    backgroundColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  paginaBtnActiva: {
    backgroundColor: "#007bff",
  },
  paginaText: {
    color: "#fff",
    fontWeight: "bold",
  },
  motivoFueraServicio: {
    color: "#dc3545", // rojo
    fontWeight: "bold",
    marginLeft: 15,
    marginTop: 2,
  },
});

