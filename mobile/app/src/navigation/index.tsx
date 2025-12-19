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
import { colors } from '../theme';

// Screens
import LoginScreenV2 from '../screens/LoginScreenV2';
import HomeScreenV2 from '../screens/HomeScreenV2';
import PropertiesScreen from '../screens/PropertiesScreen';
import LeadsScreenV2 from '../screens/LeadsScreenV2';
import LeadDetailScreen from '../screens/LeadDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  LeadDetail: { id: number };
};

export type TabParamList = {
  Home: undefined;
  Propriedades: undefined;
  Leads: undefined;
  Agenda: undefined;
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
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopWidth: 1,
          borderTopColor: colors.border.primary + '40',
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
        component={HomeScreenV2}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>🏠</Text>
          ),
        }}
      />Navigator
      <Tab.Screen
        name="Propriedades"
        component={PropertiesScreen}
        options={{
          tabBarLabel: 'Angariações',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>🏘️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Leads"
        component={LeadsScreenV2}
        options={{
          tabBarLabel: 'Leads',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={HomeScreenV2}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.cyan} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreenV2} />
        )}
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
