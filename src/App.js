import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TelaLogin } from './screens/TelaLogin';
import { TelaFornecedores } from './screens/TelaFornecedores';
import { TelaGarantia } from './screens/TelaGarantia';
import { TelaConfiguracoes } from './screens/TelaConfiguracoes';
import { TelaListaGarantias } from './screens/TelaListaGarantias';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={TelaLogin} options={{ headerShown: false }} />
        <Stack.Screen name="Fornecedores" component={TelaFornecedores} options={{ title: 'Selecione o Fornecedor' }} />
        <Stack.Screen name="TratamentoGarantia" component={TelaGarantia} options={{ title: 'Tratamento de Garantia' }} />
        <Stack.Screen name="Configuracoes" component={TelaConfiguracoes} options={{ title: 'Configurações Básicas' }} />
        <Stack.Screen name="GarantiasTratadas" component={TelaListaGarantias} options={{ title: 'Garantias Tratadas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}