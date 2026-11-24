import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TelaLogin } from './screens/TelaLogin';
import { TelaMenuPrincipal } from './screens/TelaMenuPrincipal';
import { TelaFornecedores } from './screens/TelaFornecedores';
import { TelaGarantia } from './screens/TelaGarantia';
import { TelaConfiguracoes } from './screens/TelaConfiguracoes';
import { TelaListaGarantias } from './screens/TelaListaGarantias';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="MenuPrincipal" component={TelaMenuPrincipal} />
        <Stack.Screen name="Fornecedores" component={TelaFornecedores} />
        <Stack.Screen name="TratamentoGarantia" component={TelaGarantia} />
        <Stack.Screen name="Configuracoes" component={TelaConfiguracoes} />
        <Stack.Screen name="GarantiasTratadas" component={TelaListaGarantias} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}