import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Traduz os códigos de erro do Firebase Auth para mensagens amigáveis em português.
 */
export const translateAuthError = (error: any): string => {
  const code = error?.code || '';
  
  switch (code) {
    case 'auth/invalid-email':
      return 'O endereço de e-mail digitado é inválido. Verifique a grafia.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Ela deve conter pelo menos 6 caracteres.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado em outra conta.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Por favor, tente novamente.';
    case 'auth/network-request-failed':
      return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas malsucedidas de login. Tente novamente mais tarde ou redefina sua senha.';
    default:
      return error?.message || 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
  }
};

/**
 * Realiza o login com e-mail e senha.
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(translateAuthError(error));
  }
};

/**
 * Cria uma nova conta com e-mail e senha.
 */
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(translateAuthError(error));
  }
};

/**
 * Realiza o logout do usuário atual.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(translateAuthError(error));
  }
};

/**
 * Monitora as alterações no estado de autenticação (sessão ativa).
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
