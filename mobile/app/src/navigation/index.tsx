/**
 * Configuração de navegação principal
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreenV2 from '../screens/LoginScreenV2';
import HomeScreenV3 from '../screens/HomeScreenV3';
import PropertiesScreen from '../screens/PropertiesScreen';
import LeadsScreenV2 from '../screens/LeadsScreenV2';
import LeadDetailScreen from '../screens/LeadDetailScreen';
import AgendaScreen from '../screens/AgendaScreen';
import AgentScreen from '../screens/AgentScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  LeadDetail: { id: number };
};

export type TabParamList = {
  Home: undefined;
  Leads: undefined;
  Propriedades: undefined;
  Agenda: undefined;
  IA: undefined;
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tabs Navigator (após login)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.cyan,
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#0a0e1a',
          borderTopWidth: 1,
          borderTopColor: '#1a1f2e',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          position: 'absolute',
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreenV3}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={focused ? colors.brand.cyan : colors.text.tertiary} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Leads"
        component={LeadsScreenV2}
        options={{
          tabBarLabel: 'Leads',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={24} 
              color={focused ? colors.brand.cyan : colors.text.tertiary} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Propriedades"
        component={PropertiesScreen}
        options={{
          tabBarLabel: 'Imóveis',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "business" : "business-outline"} 
              size={24} 
              color={focused ? colors.brand.cyan : colors.text.tertiary} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              size={24} 
              color={focused ? colors.brand.cyan : colors.text.tertiary} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="IA"
        component={AgentScreen}
        options={{
          tabBarLabel: 'IA',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "bulb" : "bulb-outline"} 
              size={24} 
              color={focused ? colors.brand.cyan : colors.text.tertiary} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
              color={focused ? colors.brand.cyan : colors.text.tertiary} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreenV2} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
