import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/config';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ConsultaRecursosScreen() {
  const [originalRecursos, setOriginalRecursos] = useState([]);
  const [modifiedRecursos, setModifiedRecursos] = useState([]);
  const [originalMoviles, setOriginalMoviles] = useState([]);
  const [modifiedMoviles, setModifiedMoviles] = useState([]);

  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroDependencia, setFiltroDependencia] = useState('');

  const [pageCapital, setPageCapital] = useState(1);
  const [pageConsignas, setPageConsignas] = useState(1);
  const [pageSuperior, setPageSuperior] = useState(1);
  const [pageMovilesMod, setPageMovilesMod] = useState(1);
  const [vista, setVista] = useState('');


  const elementosPorPagina = 6;

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const snapshotRecursos = await getDocs(collection(db, 'recursos'));
        const recursosList = snapshotRecursos.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const snapshotMods = await getDocs(collection(db, 'registros'));
        const modsList = snapshotMods.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const snapshotMoviles = await getDocs(collection(db, 'moviles'));
        const movilesList = snapshotMoviles.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Separar registros de móviles originales y modificados
        const originalesMoviles = movilesList.filter((item) => !item.modificado);
        const modificadosMoviles = movilesList.filter((item) => item.modificado);

        // Ordenar cada lista por fecha descendente (más reciente primero)
        const sortByDateDesc = (a, b) => {
          const dateA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
          const dateB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
          return dateB - dateA;
        };

        recursosList.sort(sortByDateDesc);
        modsList.sort(sortByDateDesc);
        originalesMoviles.sort(sortByDateDesc);
        modificadosMoviles.sort(sortByDateDesc);

        setOriginalRecursos(recursosList);
        setModifiedRecursos(modsList);
        setOriginalMoviles(originalesMoviles);
        setModifiedMoviles(modificadosMoviles);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    obtenerDatos();
  }, []);

  // Formatear fecha y hora en formato DD/MM/AAAA HH:mm (24h)
  const formatDateTime = (fecha) => {
    const dateObj = fecha?.toDate ? fecha.toDate() : new Date(fecha);
    if (isNaN(dateObj)) return '';
    const dateStr = dateObj.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timeStr = dateObj.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dateStr} ${timeStr}`;
  };

  const filtrarDatos = (lista) => {
    return lista.filter((item) => {
      // Convertir fecha a formato YYYY-MM-DD para comparar
      const dateObj = item.fecha?.toDate ? item.fecha.toDate() : new Date(item.fecha);
      const fechaYYYYMMDD = !isNaN(dateObj) ? dateObj.toISOString().slice(0, 10) : '';
      const fechaOk = filtroFecha ? fechaYYYYMMDD.includes(filtroFecha) : true;
      const depOk = filtroDependencia
        ? (item.dependencia || '').toLowerCase().includes(filtroDependencia.toLowerCase())
        : true;
      return fechaOk && depOk;
    });
  };

  // Listas filtradas de registros modificados
  const filteredModRec = filtrarDatos(modifiedRecursos);
  const filteredModMov = filtrarDatos(modifiedMoviles);

  // Funciones de paginación
  const paginar = (datos, pagina) =>
    datos.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina);
  const totalPaginas = (datos) => Math.ceil(datos.length / elementosPorPagina);

  // Reiniciar página al cambiar filtros
  useEffect(() => {
    setPageCapital(1);
    setPageConsignas(1);
    setPageSuperior(1);
    setPageMovilesMod(1);
  }, [filtroFecha, filtroDependencia]);

  // Renderizar botones de paginación
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

  // Renderizado de elementos por categoría (registros modificados)
  const renderCapitalItem = ({ item }) => (
    <View style={[styles.card, item.modificado && styles.cardModificado]}>
      {item.modificado && (
        <Text style={styles.etiquetaModificado}>MODIFICADO</Text>
      )}
      <Text style={styles.fecha}>
        📅 Fecha: {formatDateTime(item.fecha)}
      </Text>
      <Text style={styles.dependencia}>
        📍 Dependencia: {item.dependencia}
      </Text>
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
            <Text style={{ color: '#007bff', marginLeft: 15 }}>
              🕑 Reducción: {ef.horarioReduccion}
            </Text>
          )}
          {ef.horaLactancia && (
            <Text style={{ color: '#dc3545', marginLeft: 15 }}>
              👶 Lactancia: {ef.horarioLactancia}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderConsignasItem = ({ item }) => (
    <View style={[styles.card, item.modificado && styles.cardModificado]}>
      {item.modificado && (
        <Text style={styles.etiquetaModificado}>MODIFICADO</Text>
      )}
      <Text style={styles.fecha}>
        📅 Fecha: {formatDateTime(item.fecha)}
      </Text>
      <Text style={styles.dependencia}>
        📍 Dependencia: {item.dependencia}
      </Text>
      <View style={{ marginTop: 10 }}>
        <Text style={[styles.subtitulo, { color: '#003366' }]}>
          📌 Consignas Cubiertas:
        </Text>
        {item.consignasCubiertas?.split('\n').map((linea, idx) => (
          <Text key={idx} style={{ marginLeft: 10, color: '#333' }}>
            • {linea}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderSuperiorItem = ({ item }) => (
    <View style={[styles.card, item.modificado && styles.cardModificado]}>
      {item.modificado && (
        <Text style={styles.etiquetaModificado}>MODIFICADO</Text>
      )}
      <Text style={styles.fecha}>
        📅 Fecha: {formatDateTime(item.fecha)}
      </Text>
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
    </View>
  );

  const renderMovilItem = ({ item }) => (
    <View style={[styles.card, item.modificado && styles.cardModificado, { borderColor: '#333' }]}>
      {item.modificado && (
        <Text style={styles.etiquetaModificado}>MODIFICADO</Text>
      )}
      <Text style={styles.fecha}>
        📅 Fecha: {formatDateTime(item.fecha)}
      </Text>
      <Text style={styles.dependencia}>
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
    
  );
  // Mostrar recursos originales
const renderOriginalRecurso = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.fecha}>📅 Fecha: {formatDateTime(item.fecha)}</Text>
    <Text style={styles.dependencia}>📍 Dependencia: {item.dependencia}</Text>
    {item.superior && (
      <>
        <Text style={styles.superior}>👮 Superior: {item.superior.jerarquia} {item.superior.nombre}</Text>
        <Text style={styles.horario}>🕒 Horario: {item.superior.horario}</Text>
      </>
    )}
    <Text style={styles.efectivos}>👥 Efectivos: {item.cantidadEfectivos}</Text>
    {item.efectivos?.length > 0 && (
      <>
        <Text style={styles.subtitulo}>📋 Efectivos:</Text>
        {item.efectivos.map((ef, i) => (
          <Text key={i} style={styles.efectivoItem}>
            • {ef.jerarquia} {ef.nombre} ({ef.horario})
          </Text>
        ))}
      </>
    )}
    {item.consignasCubiertas && (
      <>
        <Text style={styles.subtitulo}>📌 Consignas:</Text>
        {item.consignasCubiertas.split('\n').map((linea, i) => (
          <Text key={i} style={styles.efectivoItem}>• {linea}</Text>
        ))}
      </>
    )}
  </View>
);

// Mostrar móviles originales
const renderOriginalMovil = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.fecha}>📅 Fecha: {formatDateTime(item.fecha)}</Text>
    <Text style={styles.dependencia}>📍 Dependencia: {item.dependencia}</Text>

    <Text style={styles.subtitulo}>✅ En Servicio:</Text>
    {item.moviles?.filter(m => m.enServicio && !m.prestamo).map((m, i) => (
      <Text key={i} style={styles.efectivoItem}>• Móvil {m.numero}</Text>
    ))}

    <Text style={styles.subtitulo}>❌ Fuera de Servicio:</Text>
    {item.moviles?.filter(m => !m.enServicio && !m.prestamo).map((m, i) => (
      <View key={i} style={{ marginLeft: 10 }}>
        <Text style={styles.efectivoItem}>• Móvil {m.numero}</Text>
        {m.motivo && <Text style={styles.motivoFueraServicio}>📝 Motivo: {m.motivo}</Text>}
      </View>
    ))}

    <Text style={styles.subtitulo}>🔄 A Préstamo:</Text>
    {item.moviles?.filter(m => m.prestamo).map((m, i) => (
      <Text key={i} style={styles.efectivoItem}>• Móvil {m.numero} → {m.destino}</Text>
    ))}

    {item.motos?.length > 0 && (
      <>
        <Text style={styles.subtitulo}>🏍 Motos en Servicio:</Text>
        {item.motos.filter(m => m.enServicio).map((m, i) => (
          <Text key={i} style={styles.efectivoItem}>• Moto {m.numero}</Text>
        ))}
        <Text style={styles.subtitulo}>🛠 Motos Fuera de Servicio:</Text>
        {item.motos.filter(m => !m.enServicio).map((m, i) => (
          <View key={i} style={{ marginLeft: 10 }}>
            <Text style={styles.efectivoItem}>• Moto {m.numero}</Text>
            {m.motivo && <Text style={styles.motivoFueraServicio}>📝 Motivo: {m.motivo}</Text>}
          </View>
        ))}
      </>
    )}
  </View>
);


  const exportarExcel = () => {
    // Preparar datos filtrados para exportar a Excel
    const capitalData = filteredModRec.map((r) => ({
      Fecha: formatDateTime(r.fecha),
      Dependencia: r.dependencia,
      'Cant. Efectivos': r.cantidadEfectivos,
    }));
    const consignasData = filteredModRec.map((r) => ({
      Fecha: formatDateTime(r.fecha),
      Dependencia: r.dependencia,
      'Consignas Cubiertas': r.consignasCubiertas?.replace(/\n/g, ' | '),
    }));
    const superiorData = filteredModRec.map((r) => ({
      Fecha: formatDateTime(r.fecha),
      Dependencia: r.dependencia,
      Jerarquía: r.superior?.jerarquia || '',
      Nombre: r.superior?.nombre || '',
      Horario: r.superior?.horario || '',
    }));
    const movilesData = filteredModMov.map((m) => ({
      Fecha: formatDateTime(m.fecha),
      Modificado: m.modificado ? '✅ MODIFICADO' : '—',
      Dependencia: m.dependencia,
      'Móviles en Servicio':
        m.moviles
          ?.filter((mov) => mov.enServicio && !mov.prestamo)
          .map((mov) => `Móvil ${mov.numero}`)
          .join(', ') || '',
      'Móviles Fuera de Servicio':
        m.moviles
          ?.filter((mov) => !mov.enServicio && !mov.prestamo)
          .map((mov) => `Móvil ${mov.numero} - ${mov.motivo}`)
          .join(', ') || '',
      'Móviles a Préstamo':
        m.moviles
          ?.filter((mov) => mov.prestamo)
          .map((mov) => `Móvil ${mov.numero} → ${mov.destino}`)
          .join(', ') || '',
      'Motos en Servicio':
        m.motos
          ?.filter((mt) => mt.enServicio)
          .map((mt) => `Moto ${mt.numero}`)
          .join(', ') || '',
      'Motos Fuera de Servicio':
        m.motos
          ?.filter((mt) => !mt.enServicio)
          .map((mt) => `Moto ${mt.numero} - ${mt.motivo}`)
          .join(', ') || '',
    }));

    const wb = XLSX.utils.book_new();
    if (capitalData.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(capitalData);
      XLSX.utils.book_append_sheet(wb, ws1, 'CapitalDiario');
    }
    if (consignasData.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(consignasData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Consignas');
    }
    if (superiorData.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(superiorData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Superior');
    }
    if (movilesData.length > 0) {
      const ws4 = XLSX.utils.json_to_sheet(movilesData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Moviles');
    }

    const depText = filtroDependencia.trim()
      ? filtroDependencia.trim().replace(/\s+/g, '_')
      : 'TODAS_DEPENDENCIAS';
    const fechaText = filtroFecha.trim() ? filtroFecha.trim() : 'TODAS_FECHAS';
    const fileName = `modificados_${depText}_${fechaText}.xlsx`;

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  return (
    <ScrollView style={styles.container}>
      {vista === '' && (
        <>
          <Text style={styles.title}>📊 Consulta de Registros</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
            <TouchableOpacity
              style={[styles.card, { width: '45%', backgroundColor: '#007bff' }]}
              onPress={() => setVista('originales')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                📘 REGISTROS DIARIOS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.card, { width: '45%', backgroundColor: '#ffc107' }]}
              onPress={() => setVista('modificados')}
            >
              <Text style={{ color: '#000', fontWeight: 'bold', textAlign: 'center' }}>
                ✏️ REGISTROS MODIFICADOS
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
  
      {vista === 'originales' && (
        <>
          <TouchableOpacity onPress={() => setVista('')} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>⬅️ Volver</Text>
          </TouchableOpacity>
  
          <Text style={styles.title}>REGISTROS ORIGINALES</Text>
          <Text style={styles.categoryTitle}>📊 Recursos Originales</Text>
          <FlatList
            data={originalRecursos}
            keyExtractor={(item) => item.id}
            renderItem={renderOriginalRecurso}
          />
          <Text style={[styles.categoryTitle, { marginTop: 20 }]}>🚔 Móviles Originales</Text>
          <FlatList
            data={originalMoviles}
            keyExtractor={(item) => item.id}
            renderItem={renderOriginalMovil}
          />
        </>
      )}
  
      {vista === 'modificados' && (
        <>
          <TouchableOpacity onPress={() => setVista('')} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>⬅️ Volver</Text>
          </TouchableOpacity>
  
          <Text style={styles.title}>REGISTROS MODIFICADOS</Text>
          <TextInput
            style={styles.input}
            placeholder="Filtrar por fecha (AAAA-MM-DD)"
            value={filtroFecha}
            onChangeText={setFiltroFecha}
          />
          <TextInput
            style={styles.input}
            placeholder="Filtrar por dependencia"
            value={filtroDependencia}
            onChangeText={setFiltroDependencia}
          />
          <TouchableOpacity onPress={exportarExcel} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>📤 Exportar a Excel</Text>
          </TouchableOpacity>
  
          <Text style={styles.categoryTitle}>📋 Capital Diario</Text>
          <FlatList
            data={paginar(filteredModRec, pageCapital)}
            keyExtractor={(item) => item.id}
            renderItem={renderCapitalItem}
          />
          {renderPaginacion(pageCapital, setPageCapital, totalPaginas(filteredModRec))}
  
          <Text style={styles.categoryTitle}>📌 Consignas</Text>
          <FlatList
            data={paginar(filteredModRec, pageConsignas)}
            keyExtractor={(item) => item.id}
            renderItem={renderConsignasItem}
          />
          {renderPaginacion(pageConsignas, setPageConsignas, totalPaginas(filteredModRec))}
  
          <Text style={styles.categoryTitle}>🚔 Móviles</Text>
          <FlatList
            data={paginar(filteredModMov, pageMovilesMod)}
            keyExtractor={(item) => item.id}
            renderItem={renderMovilItem}
          />
          {renderPaginacion(pageMovilesMod, setPageMovilesMod, totalPaginas(filteredModMov))}
  
          <Text style={styles.categoryTitle}>👮 Superior</Text>
          <FlatList
            data={paginar(filteredModRec, pageSuperior)}
            keyExtractor={(item) => item.id}
            renderItem={renderSuperiorItem}
          />
          {renderPaginacion(pageSuperior, setPageSuperior, totalPaginas(filteredModRec))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#003366',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  exportButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  exportButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#007bff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardModificado: {
    borderColor: '#ffc107', // Borde amarillo
    backgroundColor: '#fffbe6', // Fondo amarillo claro
    borderWidth: 2,
  },
  etiquetaModificado: {
    backgroundColor: '#ffc107',
    color: '#000',
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 13,
  },
  fecha: { fontWeight: 'bold', marginBottom: 6, fontSize: 16 },
  dependencia: { fontSize: 15, marginBottom: 4 },
  superior: { fontSize: 15, marginBottom: 4 },
  horario: { fontSize: 15, marginBottom: 4 },
  efectivos: { fontSize: 15, marginBottom: 8 },
  subtitulo: { fontWeight: 'bold', marginTop: 10, marginBottom: 4 },
  efectivoItem: { fontSize: 14, marginLeft: 10, color: '#333' },
  paginacion: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    flexWrap: 'wrap',
    gap: 5,
  },
  paginaBtn: {
    backgroundColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  paginaBtnActiva: {
    backgroundColor: '#007bff',
  },
  paginaText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  motivoFueraServicio: {
    color: '#dc3545', // rojo
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 2,
  },
  seccionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tarjetaSelector: {
    backgroundColor: '#007bff',
    padding: 20,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
  },
  tarjetaTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  btnVolver: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  textoVolver: {
    color: '#fff',
    fontWeight: 'bold',
  },

});

