import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground
} from 'react-native';

// Se testar no celular via Expo Go, troque 'localhost' pelo IP do seu PC (ex: https://garantiamundial-production.up.railway.app)
const API_URL = 'https://garantiamundial-production.up.railway.app';

// Logo da Mundial salvo em app/src/assets/logo-mundial.png
const LOGO_MUNDIAL = require('../assets/logo-mundial.png');

// Quando tiver as fotos em app/src/assets/, descomente cada linha correspondente:
const USUARIOS = [
  {
    nome: 'Paulo',
    // foto: require('../assets/paulo.jpg')
    foto: require('../assets/paulo.jpg'),
  },
  {
    nome: 'Ocione',
    // foto: require('../assets/osione.jpg')
    foto: require('../assets/ocione.jpg'),
  },
  {
    nome: 'Wallace',
    // foto: require('../assets/wallace.jpg')
    foto: require('../assets/wallace.jpg'),
  }
];

export function TelaLogin({ navigation }) {
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const selecionarUsuario = (nome) => {
    setUsuarioSelecionado(nome);
    setSenha('');
    setMensagemErro('');
  };

  const confirmarLogin = async () => {
    setMensagemErro('');

    if (!senha.trim()) {
      setMensagemErro('Digite a senha definida pelo administrador.');
      return;
    }

    setEntrando(true);
    try {
      const resposta = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: usuarioSelecionado, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(dados.erro || 'Senha inválida.');
        return;
      }

      setSenha('');
      navigation.replace('MenuPrincipal', { usuario: dados.usuario });
    } catch (erro) {
      setMensagemErro('Erro de conexão: verifique se o node server.js está rodando na porta 8082.');
    } finally {
      setEntrando(false);
    }
  };

  return (
    <ImageBackground
      source={LOGO_MUNDIAL}
      style={styles.fundoImagem}
      imageStyle={styles.imagemFundoEstilo}
      resizeMode="cover"
    >
      <View style={styles.overlayAzul}>
        <View style={styles.cardPrincipal}>
          <Text style={styles.titulo}>Quem está acessando?</Text>
          <Text style={styles.subtitulo}>Mundial • Controle de Garantia</Text>

          <View style={styles.rowUsuarios}>
            {USUARIOS.map((user) => {
              const ativo = usuarioSelecionado === user.nome;
              return (
                <TouchableOpacity
                  key={user.nome}
                  style={[styles.avatarBtn, ativo && styles.avatarBtnAtivo]}
                  onPress={() => selecionarUsuario(user.nome)}
                >
                  <View style={[styles.avatarCirculo, ativo && styles.avatarCirculoAtivo]}>
                    {user.foto ? (
                      <Image source={user.foto} style={styles.fotoUsuario} />
                    ) : (
                      <Text style={styles.iniciais}>{user.nome[0]}</Text>
                    )}
                  </View>
                  <Text style={[styles.nome, ativo && styles.nomeAtivo]}>{user.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {usuarioSelecionado && (
            <View style={styles.boxSenha}>
              <Text style={styles.labelSenha}>Senha de {usuarioSelecionado}:</Text>
              <TextInput
                style={styles.inputSenha}
                value={senha}
                onChangeText={setSenha}
                placeholder="Digite sua senha"
                secureTextEntry
              />

              {mensagemErro !== '' && (
                <Text style={styles.textoErro}>{mensagemErro}</Text>
              )}

              <TouchableOpacity
                style={[styles.botaoEntrar, entrando && { opacity: 0.6 }]}
                onPress={confirmarLogin}
                disabled={entrando}
              >
                <Text style={styles.textoBotao}>
                  {entrando ? 'Verificando...' : 'Entrar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.avisoAdmin}>
            Senhas definidas pelo administrador. Alterações devem ser solicitadas diretamente a ele.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundoImagem: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#092556'
  },
  imagemFundoEstilo: {
    opacity: 0.45
  },
  overlayAzul: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(9, 37, 86, 0.55)'
  },
  cardPrincipal: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: 'rgba(248, 251, 255, 0.96)',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    shadowColor: '#04122b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#092556',
    textAlign: 'center'
  },
  subtitulo: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 22,
    fontWeight: '500'
  },
  rowUsuarios: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18
  },
  avatarBtn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent'
  },
  avatarBtnAtivo: {
    backgroundColor: '#dbeafe',
    borderColor: '#1d4ed8'
  },
  avatarCirculo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0f3d7a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#93c5fd'
  },
  avatarCirculoAtivo: {
    borderColor: '#1d4ed8',
    transform: [{ scale: 1.04 }]
  },
  fotoUsuario: {
    width: '100%',
    height: '100%'
  },
  iniciais: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  nome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b'
  },
  nomeAtivo: {
    color: '#1d4ed8',
    fontWeight: 'bold'
  },
  boxSenha: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1'
  },
  labelSenha: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8
  },
  inputSenha: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
    color: '#0f172a'
  },
  textoErro: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12
  },
  botaoEntrar: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  avisoAdmin: {
    marginTop: 20,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 17
  }
});