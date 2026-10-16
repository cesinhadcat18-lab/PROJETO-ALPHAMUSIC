import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

export default function TelaLogin() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const USUARIO_CORRETO = 'GESTAOALPHAMUSIC';
  const SENHA_CORRETA = '35181730';

 const fazerLogin = () => {
  if (usuario === USUARIO_CORRETO && senha === SENHA_CORRETA) {
    Alert.alert('✅ Sucesso!', 'Bem-vindo!', [
      { 
        text: 'OK', 
        onPress: () => router.push('/(tabs)')
      }
    ]);
  } else {
    Alert.alert('❌ Erro', 'Usuário ou senha incorretos!');
  }
};

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>🔒 Entrar</Text>

      <TextInput
        style={estilos.campo}
        placeholder="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
      />

      <TextInput
        style={estilos.campo}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={estilos.botao} onPress={fazerLogin}>
        <Text style={estilos.textoBotao}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  campo: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botao: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});