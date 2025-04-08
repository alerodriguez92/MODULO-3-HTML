import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  SpaceMono_400Regular,
} from "@expo-google-fonts/space-mono";

import HomeScreen from "./src/screens/HomeScreen";
import RecursosDiariosScreen from "./src/screens/RecursosDiariosScreen";
import MobileGuardScreen from "./src/screens/MobileGuardScreen";
import ConsultaRecursosScreen from "./src/screens/ConsultaRecursosScreen";
import ModificarCapitalDiarioScreen from "./src/screens/ModificarCapitalDiarioScreen";

const Drawer = createDrawerNavigator();
export const AdminContext = React.createContext();

export default function App() {
  const [esAdmin, setEsAdmin] = useState(false);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    SpaceMono: SpaceMono_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <AdminContext.Provider value={{ esAdmin, setEsAdmin }}>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Inicio"
          screenOptions={{
            headerShown: false,  // Ocultamos el header para HomeScreen
            drawerType: 'front', // Muestra el menú con el icono hamburguesa
            drawerStyle: {
              backgroundColor: '#fff', // Fondo blanco
            },
            
          }}
        >
          <Drawer.Screen
            name="Inicio"
            component={HomeScreen}
            options={{
              drawerIcon: () => <Ionicons name="menu-outline" size={30} />, // Icono de menú hamburguesa
            }}
          />
          <Drawer.Screen
            name="Recursos Diarios"
            component={RecursosDiariosScreen}
            options={{
              drawerIcon: () => <Ionicons name="clipboard-outline" size={20} />,
              headerShown: true,  // Mostramos el header en esta pantalla
            }}
          />
          <Drawer.Screen
            name="Móviles en Servicio"
            component={MobileGuardScreen}
            options={{
              drawerIcon: () => <MaterialIcons name="local-police" size={20} />,
              headerShown: true,  // Mostramos el header en esta pantalla
            }}
          />
          <Drawer.Screen
            name="Modificar Capital Diario"
            component={ModificarCapitalDiarioScreen}
            options={{
              drawerIcon: () => <Ionicons name="create-outline" size={20} />,
              headerShown: true,  // Mostramos el header en esta pantalla
            }}
          />
          {esAdmin && (
            <Drawer.Screen
              name="Consulta de Recursos"
              component={ConsultaRecursosScreen}
              options={{
                drawerIcon: () => <Ionicons name="search" size={20} />,
                headerShown: true,  // Mostramos el header en esta pantalla
              }}
            />
          )}
        </Drawer.Navigator>
      </NavigationContainer>
    </AdminContext.Provider>
  );
}
