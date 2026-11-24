import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { TEMA } from '../utils/tema';

// Quando você salvar os logos dos fornecedores em app/src/assets/, basta descomentar o require correspondente:
export const LISTA_FORNECEDORES = [
  { id: '1', nome: 'Electrolux', categoria: 'Eletrodomésticos', sigla: 'ELX', cor: '#0F294A', logo: require('../assets/logo-electrolux.png') },
  { id: '2', nome: 'Whirlpool', categoria: 'Eletrodomésticos', sigla: 'WHP', cor: '#B45309', logo: require('../assets/logo-whirlpool.png')},
  { id: '3', nome: 'CP', categoria: 'Placas Eletrônicas', sigla: 'CP', cor: '#1D4ED8', logo: require('../assets/logo-cp.png')  },
  { id: '4', nome: 'Emicol', categoria: 'Placas e Componentes', sigla: 'EMC', cor: '#0369A1', logo: require('../assets/logo-emicol.png')  },
  { id: '5', nome: 'Danfoss', categoria: 'Compressores e Refrigeração', sigla: 'DNF', cor: '#DC2626', logo: require('../assets/logo-danfoss.png') },
  { id: '6', nome: 'Full Gauge', categoria: 'Controladores Digitais', sigla: 'FG', cor: '#15803D', logo: require('../assets/logo-fullgauge.png') },
  { id: '7', nome: 'AGT', categoria: 'Peças de Refrigeração', sigla: 'AGT', cor: '#4338CA', logo: require('../assets/logo-agt.png') },
];

export function BarraFornecedores({ navigation, usuario, fornecedorAtivo }) {
  const [expandida, setExpandida] = useState(false);

  const webHoverProps =
    Platform.OS === 'web'
      ? {
          onMouseEnter: () => setExpandida(true),
          onMouseLeave: () => setExpandida(false),
        }
      : {};

  return (
    <View
      {...webHoverProps}
      style={[
        styles.barra,
        expandida ? styles.barraExpandida : styles.barraRecolhida,
      ]}
    >
      {/* Botão para abrir/fechar no toque (mobile ou clique na web) */}
      <TouchableOpacity
        style={styles.botaoToggle}
        onPress={() => setExpandida((prev) => !prev)}
      >
        <Text style={styles.iconeToggle}>{expandida ? '◀' : '▶'}</Text>
        {expandida && <Text style={styles.tituloBarra}>Fornecedores</Text>}
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.lista}>
        {LISTA_FORNECEDORES.map((item) => {
          const selecionado = fornecedorAtivo === item.nome;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemFornecedor,
                !expandida && styles.itemRecolhido,
                selecionado && styles.itemAtivo,
              ]}
              onPress={() =>
                navigation.navigate('TratamentoGarantia', {
                  fornecedor: item.nome,
                  usuario,
                })
              }
            >
              <View style={[styles.logoBox, { backgroundColor: item.logo ? '#FFF' : item.cor }]}>
                {item.logo ? (
                  <Image source={item.logo} style={styles.logoImg} resizeMode="contain" />
                ) : (
                  <Text style={styles.siglaTexto}>{item.sigla}</Text>
                )}
              </View>

              {expandida && (
                <View style={styles.infoFornecedor}>
                  <Text style={[styles.nomeFornecedor, selecionado && styles.nomeAtivo]}>
                    {item.nome}
                  </Text>
                  <Text style={styles.categoriaFornecedor} numberOfLines={1}>
                    {item.categoria}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: TEMA.cores.cardBranco,
    borderRightWidth: 1,
    borderRightColor: TEMA.cores.azulBorda,
    paddingVertical: 10,
    ...TEMA.sombraSuave,
    zIndex: 10,
  },
  barraRecolhida: {
    width: 68,
    alignItems: 'center',
  },
  barraExpandida: {
    width: 230,
    paddingHorizontal: 10,
  },
  botaoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TEMA.cores.azulClaro,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  iconeToggle: {
    color: TEMA.cores.azulMundial,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tituloBarra: {
    color: TEMA.cores.azulMundial,
    fontWeight: 'bold',
    fontSize: 13,
  },
  lista: {
    gap: 10,
    paddingBottom: 20,
  },
  itemFornecedor: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 10,
  },
  itemRecolhido: {
    justifyContent: 'center',
    padding: 4,
    backgroundColor: 'transparent',
  },
  itemAtivo: {
    backgroundColor: TEMA.cores.azulClaro,
    borderColor: TEMA.cores.azulRoyal,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
  },
  logoImg: {
    width: '85%',
    height: '85%',
  },
  siglaTexto: {
    color: TEMA.cores.branco,
    fontWeight: 'bold',
    fontSize: 13,
  },
  infoFornecedor: {
    flex: 1,
  },
  nomeFornecedor: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.cores.textoEscuro,
  },
  nomeAtivo: {
    color: TEMA.cores.azulRoyal,
  },
  categoriaFornecedor: {
    fontSize: 11,
    color: TEMA.cores.textoSuave,
  },
});