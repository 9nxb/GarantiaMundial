import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TEMA } from '../utils/tema';
import { CabecalhoMundial } from '../components/CabecalhoMundial';
import { BarraFornecedores } from '../components/BarraFornecedores';
import { PopupTarefas } from '../components/PopupTarefas';

export function TelaMenuPrincipal({ navigation, route }) {
  const usuario = route?.params?.usuario;
  const [abrirAnotacoes, setAbrirAnotacoes] = useState(false);

  const funcoesMenu = [
    {
      id: 'solicitar',
      titulo: 'Solicitar Garantias',
      descricao: 'Abrir nova tratativa de peça, anexar fotos, notas fiscais e número de série',
      tag: 'Novo Registro',
      destaque: true,
      acao: () => navigation.navigate('TratamentoGarantia', { fornecedor: 'Electrolux', usuario }),
    },
    {
      id: 'acompanhar',
      titulo: 'Acompanhamento das Garantias Solicitadas',
      descricao: 'Consultar IDs registrados, status por cor, fotos e retornos dos fabricantes',
      tag: 'Histórico & Status',
      destaque: false,
      acao: () => navigation.navigate('GarantiasTratadas', { usuario }),
    },
    {
      id: 'fornecedores',
      titulo: 'Fornecedores',
      descricao: 'Visualizar fabricantes cadastrados, categorias técnicas e regras de envio',
      tag: 'Catálogo',
      destaque: false,
      acao: () => navigation.navigate('Fornecedores', { usuario }),
    },
    {
      id: 'anotacoes',
      titulo: 'Anotações Próprias',
      descricao: 'Bloco pessoal de lembretes e mural compartilhado da equipe Mundial',
      tag: 'Notas & Avisos',
      destaque: false,
      acao: () => setAbrirAnotacoes(true),
    },
    {
      id: 'configuracoes',
      titulo: 'Configurações',
      descricao: 'Preferências do aplicativo, perfil de acesso e opções do sistema',
      tag: 'Sistema',
      destaque: false,
      acao: () => navigation.navigate('Configuracoes', { usuario }),
    },
  ];

  return (
    <View style={styles.tela}>
      <CabecalhoMundial
        titulo="Mundial Refrigeração"
        subtitulo="Painel Central de Garantias"
        usuario={usuario}
        navigation={navigation}
        mostrarVoltar={false}
      />

      <View style={styles.corpo}>
        {/* Barra lateral retrátil só com logos até clicar / passar o mouse */}
        <BarraFornecedores navigation={navigation} usuario={usuario} />

        <ScrollView contentContainerStyle={styles.areaPrincipal}>
          <View style={styles.boasVindas}>
            <Text style={styles.tituloSecao}>Menu Principal</Text>
            <Text style={styles.subtituloSecao}>
              Selecione uma função abaixo ou escolha um fabricante na barra lateral
            </Text>
          </View>

          <View style={styles.gradeRetangulos}>
            {funcoesMenu.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.retangulo, item.destaque && styles.retanguloDestaque]}
                onPress={item.acao}
                activeOpacity={0.85}
              >
                <View style={styles.topoRetangulo}>
                  <View style={[styles.badgeTag, item.destaque && styles.badgeTagDestaque]}>
                    <Text style={[styles.textoTag, item.destaque && styles.textoTagDestaque]}>
                      {item.tag}
                    </Text>
                  </View>
                  <Text style={[styles.seta, item.destaque && styles.setaDestaque]}>→</Text>
                </View>

                <Text style={[styles.tituloCard, item.destaque && styles.tituloCardDestaque]}>
                  {item.titulo}
                </Text>
                <Text style={[styles.descCard, item.destaque && styles.descCardDestaque]}>
                  {item.descricao}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.botaoSair}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.textoSair}>Trocar Usuário / Sair</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Modal de Anotações Próprias */}
      <PopupTarefas
        visivel={abrirAnotacoes}
        aoFechar={() => setAbrirAnotacoes(false)}
        usuario={usuario}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: TEMA.cores.fundoTela,
  },
  corpo: {
    flex: 1,
    flexDirection: 'row',
  },
  areaPrincipal: {
    padding: 20,
    paddingBottom: 40,
  },
  boasVindas: {
    marginBottom: 18,
  },
  tituloSecao: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEMA.cores.azulMundial,
  },
  subtituloSecao: {
    fontSize: 13,
    color: TEMA.cores.textoSuave,
    marginTop: 3,
  },
  gradeRetangulos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  retangulo: {
    flexGrow: 1,
    flexBasis: 280,
    backgroundColor: TEMA.cores.cardBranco,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: TEMA.cores.azulBorda,
    ...TEMA.sombraSuave,
  },
  retanguloDestaque: {
    backgroundColor: TEMA.cores.azulMundial,
    borderColor: TEMA.cores.azulRoyal,
  },
  topoRetangulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeTag: {
    backgroundColor: TEMA.cores.azulClaro,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeTagDestaque: {
    backgroundColor: TEMA.cores.azulRoyal,
  },
  textoTag: {
    fontSize: 11,
    fontWeight: '700',
    color: TEMA.cores.azulMundial,
  },
  textoTagDestaque: {
    color: TEMA.cores.branco,
  },
  seta: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEMA.cores.azulRoyal,
  },
  setaDestaque: {
    color: TEMA.cores.branco,
  },
  tituloCard: {
    fontSize: 17,
    fontWeight: 'bold',
    color: TEMA.cores.azulMundial,
    marginBottom: 6,
  },
  tituloCardDestaque: {
    color: TEMA.cores.branco,
  },
  descCard: {
    fontSize: 13,
    color: TEMA.cores.textoSuave,
    lineHeight: 19,
  },
  descCardDestaque: {
    color: '#DBEAFE',
  },
  botaoSair: {
    marginTop: 28,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: TEMA.cores.cardBranco,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  textoSair: {
    color: TEMA.cores.textoSuave,
    fontWeight: '600',
    fontSize: 13,
  },
});