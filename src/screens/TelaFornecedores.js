import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export function TelaFornecedores({ navigation }) {
  const fornecedores = [
    { id: '1', nome: 'Electrolux', categoria: 'Eletrodomésticos' },
    { id: '2', nome: 'Whirlpool', categoria: 'Eletrodomésticos' },
    { id: '3', nome: 'CP', categoria: 'Placas Eletrônicas' },
    { id: '4', nome: 'Emicol', categoria: 'Placas e Componentes' },
    { id: '5', nome: 'Danfoss', categoria: 'Compressores e Refrigeração' },
    { id: '6', nome: 'Full Gauge', categoria: 'Controladores Digitais' },
    { id: '7', nome: 'AGT', categoria: 'Peças de Refrigeração' },
  ];

  return (
    <View style={styles.tela}>
      <View style={styles.topoAcoes}>
        <TouchableOpacity
          style={styles.botaoTratativas}
          onPress={() => navigation.navigate('GarantiasTratadas')}
        >
          <Text style={styles.textoBotaoTratativas}>
            Acompanhar Tratativas de Garantia
          </Text>
          <Text style={styles.subtextoBotaoTratativas}>
            Ver IDs, fotos anexadas e atualizar status (Concluída / Negada)
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={fornecedores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TratamentoGarantia', { fornecedor: item.nome })}
          >
            <Text style={styles.nomeFornecedor}>{item.nome}</Text>
            <Text style={styles.categoria}>{item.categoria}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  topoAcoes: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6
  },
  botaoTratativas: {
    backgroundColor: '#1d4ed8',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3b82f6'
  },
  textoBotaoTratativas: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  subtextoBotaoTratativas: {
    color: '#dbeafe',
    fontSize: 12,
    marginTop: 3
  },
  container: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2
  },
  nomeFornecedor: { fontSize: 18, fontWeight: 'bold' },
  categoria: { fontSize: 14, color: '#666', marginTop: 5 }
});