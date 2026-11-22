import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export function TelaConfiguracoes() {
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [alertas, setAlertas] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.linkFoto}>Alterar foto de perfil</Text>
      <View style={styles.linha}>
        <Text>Tema Escuro / Cor de Fundo</Text>
        <Switch value={temaEscuro} onValueChange={setTemaEscuro} />
      </View>
      <View style={styles.linha}>
        <Text>Alertas de Vencimento</Text>
        <Switch value={alertas} onValueChange={setAlertas} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  linkFoto: { color: '#007AFF', textAlign: 'center', marginBottom: 30, fontSize: 16 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }
});