import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  useFonts as useGoogleFonts,
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

  // ✅ Carga de fuentes Google + íconos Expo
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
            headerStyle: { backgroundColor: "#007bff" },
            headerTintColor: "#fff",
          }}
        >
          <Drawer.Screen
            name="Inicio"
            component={HomeScreen}
            options={{ drawerIcon: () => <Ionicons name="home-outline" size={20} /> }}
          />
          <Drawer.Screen
            name="Recursos Diarios"
            component={RecursosDiariosScreen}
            options={{ drawerIcon: () => <Ionicons name="clipboard-outline" size={20} /> }}
          />
          <Drawer.Screen
            name="Móviles en Servicio"
            component={MobileGuardScreen}
            options={{ drawerIcon: () => <MaterialIcons name="local-police" size={20} /> }}
          />
          <Drawer.Screen
            name="Modificar Capital Diario"
            component={ModificarCapitalDiarioScreen}
            options={{ drawerIcon: () => <Ionicons name="create-outline" size={20} /> }}
          />
          {esAdmin && (
            <Drawer.Screen
              name="Consulta de Recursos"
              component={ConsultaRecursosScreen}
              options={{ drawerIcon: () => <Ionicons name="search" size={20} /> }}
            />
          )}
        </Drawer.Navigator>
      </NavigationContainer>
    </AdminContext.Provider>
  );
}

