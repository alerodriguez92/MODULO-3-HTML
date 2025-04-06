import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ScrollView, Alert, Platform, StyleSheet, Switch, ActivityIndicator
} from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const mostrarAlerta = (titulo, mensaje) => {
  console.log("🚨 ALERTA:", titulo, mensaje);
  alert(`${titulo}\n${mensaje}`);
};



export default function ModificarCapitalDiarioScreen() {
  const [vista, setVista] = useState(""); // "" | "efectivos" | "moviles"
  const [dependencia, setDependencia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

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
  const [cantidadConsignas, setCantidadConsignas] = useState("0");
const [listaConsignas, setListaConsignas] = useState([]);
const [editandoIndex, setEditandoIndex] = useState(null);


  const [numeroMovil, setNumeroMovil] = useState("");
  const [esServicio, setEsServicio] = useState(true);
  const [motivoFueraServicio, setMotivoFueraServicio] = useState("");
  const [moviles, setMoviles] = useState([]);

  const db = getFirestore();
  const auth = getAuth();

  const agregarPolicia = () => {
   console.log("🟢 Se presionó Agregar Policía");
              if (!jerarquia || !nombrePolicia || !horarioPolicia) {
      mostrarAlerta("Error", "Completá todos los campos del policía antes de agregar.");
      return;
    }
  
    const nuevo = {
      jerarquia: jerarquia.toUpperCase(),
      nombre: nombrePolicia.toUpperCase(),
      horario: horarioPolicia.toUpperCase(),
      reduccionHoraria: tieneReduccion,
      horaLactancia: tieneLactancia,
      horarioReduccion,
      horarioLactancia,
      modificado: true,
    };
  
    // Si está en modo edición, reemplaza el policía editado
    if (editandoIndex !== null) {
      const actualizado = [...policias];
      actualizado[editandoIndex] = nuevo;
      setPolicias(actualizado);
      setEditandoIndex(null); // salir del modo edición
    } else {
      setPolicias([...policias, nuevo]);
    }
  
    // Limpiar campos
    setNombrePolicia("");
    setJerarquia("");
    setHorarioPolicia("");
    setTieneReduccion(false);
    setTieneLactancia(false);
    setHorarioReduccion("");
    setHorarioLactancia("");
  };
  
  

  // Función para eliminar un policía
  const eliminarPolicia = (index) => {
    const policiasActualizados = policias.filter((_, i) => i !== index);
    setPolicias(policiasActualizados); // Actualiza el estado
    console.log(`Policía en el índice ${index} eliminado`);
  };

  // Función para habilitar la edición
  const editarPolicia = (index) => {
    const policiaSeleccionado = policias[index];
    setJerarquia(policiaSeleccionado.jerarquia);
    setNombrePolicia(policiaSeleccionado.nombre);
    setHorarioPolicia(policiaSeleccionado.horario);
    setTieneReduccion(policiaSeleccionado.reduccionHoraria);
    setTieneLactancia(policiaSeleccionado.horaLactancia);
    setHorarioReduccion(policiaSeleccionado.horarioReduccion || "");
    setHorarioLactancia(policiaSeleccionado.horarioLactancia || "");
    setEditandoIndex(index); // Marcamos el índice para editar
    console.log(`Editando policía en el índice ${index}`);
  };

  const agregarMovil = () => {
    if (!numeroMovil.trim()) return;
    if (!esServicio && !motivoFueraServicio.trim()) return;

    const nuevoMovil = {
      numero: numeroMovil,
      enServicio: esServicio,
      motivo: esServicio ? "" : motivoFueraServicio.trim(),
      modificado: true, // Marcar como modificado
    };

    setMoviles([...moviles, nuevoMovil]);
    setNumeroMovil("");
    setEsServicio(true);
    setMotivoFueraServicio("");
  };
  const guardarTodoEnFirebase = async () => {
    if (!dependencia.trim()) {
      mostrarAlerta("Error", "Ingresá la dependencia.");
      return;
    }
  
    setGuardando(true);

    try {
      const usuario = auth.currentUser;
      const fecha = new Date().toISOString();

      if (vista === "efectivos") {
        if (!superiorJerarquia || !superiorNombre || !superiorHorario || !cantidadEfectivos) {
          setGuardando(false);
          mostrarAlerta("Error", "Llená todos los campos del formulario antes de guardar.");
          return;
        }
        
        if (policias.length !== parseInt(cantidadEfectivos)) {
          setGuardando(false);
          mostrarAlerta("Error", `Debés agregar exactamente ${cantidadEfectivos} policías antes de guardar.`);
          return;
        }
        
        if (listaConsignas.some((c) => !c.trim())) {
          setGuardando(false);
          mostrarAlerta("Error", "Debe completar todas las consignas indicadas.");
          return;
        }
        
        const consignasFinal = listaConsignas.length > 0 && listaConsignas.some((c) => c.trim())
        ? listaConsignas.join("\n")
        : "SIN CONSIGNAS";
      
      const registro = {
        fecha,
        usuario: usuario?.email || "anónimo",
        dependencia: dependencia.toUpperCase(),
        superior: {
          jerarquia: superiorJerarquia.toUpperCase(),
          nombre: superiorNombre.toUpperCase(),
          horario: superiorHorario.toUpperCase(),
        },
        cantidadEfectivos,
        efectivos: policias,
        consignasCubiertas: consignasFinal,
        modificado: true,
      };
      

        await addDoc(collection(db, "registros"), registro);
        setPolicias([]); // Limpiar después de guardar
        setCantidadEfectivos("");
        setSuperiorJerarquia("");
        setSuperiorNombre("");
        setSuperiorHorario("");
      }

      if (vista === "moviles") {
        if (moviles.length === 0) {
          setGuardando(false);
          return;
        }

        const registro = {
          fecha,
          usuario: usuario?.email || "anónimo",
          dependencia: dependencia.toUpperCase(),
          moviles,
          modificado: true, // Marcar como modificado
        };

        await addDoc(collection(db, "moviles"), registro);
        setMoviles([]); // Limpiar después de guardar
      }

      setGuardadoExitoso(true);
      setTimeout(() => {
        setGuardadoExitoso(false);
        setVista("");
        setDependencia("");
      }, 2000);
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>✏️ Modificación Capital Diario</Text>

        {vista === "" && !guardando && !guardadoExitoso && (
          <View style={{ gap: 20 }}>
            <TouchableOpacity style={styles.optionButton} onPress={() => setVista("efectivos")}>
              <Text style={styles.optionText}>📋 Modificar Datos de Capital Diario</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => setVista("moviles")}>
              <Text style={styles.optionText}>🚓 Modificar Parque Automotor</Text>
            </TouchableOpacity>
          </View>
        )}

        {vista !== "" && (
          <>
            <TouchableOpacity onPress={() => setVista("")} style={styles.backButton}>
              <Text style={styles.optionText}>⬅️ Volver</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>🏢 Dependencia</Text>
            <TextInput style={styles.input} value={dependencia} onChangeText={(text) => setDependencia(text.toUpperCase())} placeholder="Ej: Comisaría 16" />

            {vista === "efectivos" && (
              <>
                {/* Sección de efectivos */}
                <Text style={styles.sectionTitle}>⭐ Superior en Turno</Text>
                <TextInput style={styles.input} placeholder="Jerarquía" value={superiorJerarquia} onChangeText={(text) => setSuperiorJerarquia(text.toUpperCase())} />
                <TextInput style={styles.input} placeholder="Apellido y Nombre" value={superiorNombre} onChangeText={(text) => setSuperiorNombre(text.toUpperCase())} />
                <TextInput style={styles.input} placeholder="Horario de Trabajo. Ej: 07 a 15 " value={superiorHorario} onChangeText={(text) => setSuperiorHorario(text)} />
                <Text style={styles.sectionTitle}>📌 Consignas Cubiertas</Text>

<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={cantidadConsignas}
  onChangeText={(text) => {
    const soloNumeros = text.replace(/[^0-9]/g, "");
    setCantidadConsignas(soloNumeros);

    const num = parseInt(soloNumeros) || 0;
    const nuevasConsignas = [...listaConsignas];
    while (nuevasConsignas.length < num) nuevasConsignas.push("");
    if (nuevasConsignas.length > num) nuevasConsignas.length = num;
    setListaConsignas(nuevasConsignas);
  }}
  placeholder="Cantidad de consignas cubiertas"
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

                <TextInput
  style={styles.input}
  keyboardType="numeric"
  value={cantidadEfectivos}
  onChangeText={(text) => {
    const soloNumeros = text.replace(/[^0-9]/g, "");
    setCantidadEfectivos(soloNumeros);
  }}
  placeholder="👥 Cantidad de Efectivos de Guardia"
/>
                <Text style={styles.sectionTitle}>🚔 Agregar Policía</Text>
                <TextInput style={styles.input} placeholder="Jerarquía" value={jerarquia} onChangeText={(text) => setJerarquia(text.toUpperCase())} />
                <TextInput style={styles.input} placeholder="Apellido y Nombre" value={nombrePolicia} onChangeText={(text) => setNombrePolicia(text.toUpperCase())} />
                <TextInput
  style={styles.input}
  placeholder="Horario Laboral. Ej: 12 x 24 y 12 x 48"
  value={horarioPolicia}
  onChangeText={(text) => setHorarioPolicia(text.toUpperCase())}
/>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>🕑 Reducción Horaria</Text>
                  <Switch value={tieneReduccion} onValueChange={setTieneReduccion} />
                </View>
                {tieneReduccion && (
                  <TextInput style={styles.input} placeholder="Indique Horario de Reducción Horaria. Ej: de 01 a 07" value={horarioReduccion} onChangeText={setHorarioReduccion} />
                )}

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>👶 Hora de Lactancia</Text>
                  <Switch value={tieneLactancia} onValueChange={setTieneLactancia} />
                </View>
                {tieneLactancia && (
                  <TextInput style={styles.input} placeholder="Indique Horario de Lactancia. Ej: 08 a 12" value={horarioLactancia} onChangeText={setHorarioLactancia} />
                )}

<TouchableOpacity
  style={styles.addButton}
  onPress={() => {
    console.log("✅ BOTÓN FUNCIONA");
    agregarPolicia();
  }}
>
  <Text style={styles.addButtonText}>Agregar Policía</Text>
</TouchableOpacity>


                {policias.length > 0 && (
  <>
    <View style={styles.tableHeader}>
      <Text style={styles.tableHeaderText}>#</Text>
      <Text style={styles.tableHeaderText}>Jerarquía</Text>
      <Text style={styles.tableHeaderText}>Nombre</Text>
      <Text style={styles.tableHeaderText}>Horario</Text>
      <Text style={styles.tableHeaderText}>Reducción</Text>
      <Text style={styles.tableHeaderText}>Lactancia</Text>
      <Text style={styles.tableHeaderText}>Acciones</Text>
    </View>

    <FlatList
      data={policias}
      renderItem={({ item, index }) => (
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>{index + 1}</Text>
          <Text style={styles.tableCell}>{item.jerarquia}</Text>
          <Text style={styles.tableCell}>{item.nombre}</Text>
          <Text style={styles.tableCell}>{item.horario}</Text>
          <Text style={styles.tableCell}>{item.reduccionHoraria ? item.horarioReduccion : '-'}</Text>
          <Text style={styles.tableCell}>{item.horaLactancia ? item.horarioLactancia : '-'}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.buttonEliminar]} onPress={() => eliminarPolicia(index)}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonEditar]} onPress={() => editarPolicia(index)}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  </>
)}

              </>
            )}

            {/* Sección de móviles */}
            {vista === "moviles" && (
              <>
                <TextInput style={styles.input} placeholder="Número de móvil" keyboardType="numeric" value={numeroMovil} onChangeText={setNumeroMovil} />
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>¿Está en servicio?</Text>
                  <Switch value={esServicio} onValueChange={(valor) => { setEsServicio(valor); if (valor) setMotivoFueraServicio(""); }} />
                </View>
                {!esServicio && (
                  <TextInput style={styles.input} placeholder="Motivo fuera de servicio" value={motivoFueraServicio} onChangeText={setMotivoFueraServicio} />
                )}
                <TouchableOpacity style={styles.addButton} onPress={agregarMovil}>
                  <Text style={styles.addButtonText}>Agregar Móvil</Text>
                </TouchableOpacity>

                {moviles.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    <Text style={styles.sectionTitle}>📋 Móviles agregados</Text>
                    {moviles.map((movil, index) => (
                      <Text key={index} style={{ marginLeft: 10 }}>
                        • Móvil {movil.numero} ({movil.enServicio ? "En servicio" : `Fuera de servicio - ${movil.motivo.toUpperCase()}`})
                      </Text>
                    ))}
                  </View>
                )}
              </>
            )}

            <TouchableOpacity style={[styles.addButton, { backgroundColor: "#28a745" }]} onPress={guardarTodoEnFirebase}>
              <Text style={styles.addButtonText}>Guardar Parte Modificado</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {(guardando || guardadoExitoso) && (
        <View style={styles.loadingOverlay}>
          {guardando && <ActivityIndicator size="large" color="#fff" />}
          <Text style={styles.loadingText}>{guardando ? "Guardando datos..." : "✅ Datos guardados con éxito"}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#003366",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
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
  addButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  optionButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
  },
  optionText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -75 }, { translateY: -40 }],
    width: 180,
    height: 80,
    backgroundColor: "#28a745",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },
  loadingText: {
    marginTop: 8,
    color: "#fff",
    fontWeight: "bold",
  },
  // Tabla Estilos
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20, // Desplaza encabezados hacia la derecha
    marginBottom: 5,
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    flex: 1, // Consistencia en la distribución de espacio
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20, // Desplaza las filas hacia la derecha
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableCell: {
    flex: 1, // Igual distribución entre columnas
    fontSize: 16,
    textAlign: "center", // Centra el contenido de cada celda
    paddingHorizontal: 5, // Espaciado interno para mejor apariencia
  },
  // Botones Eliminar y Editar
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Desplaza los botones hacia la derecha
    alignItems: "center",
    marginLeft: 20, // Ajusta margen adicional hacia la derecha
  },
  button: {
    padding: 8,
    borderRadius: 5,
    margin: 5,
  },
  buttonEliminar: {
    backgroundColor: "red",
  },
  buttonEditar: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
