
import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { Client, Transaction, Credential, TransactionType, Platform, ProjectType } from '../types';

const isFirebaseSetup = () => {
  try {
    const app = getApp();
    return !app.options.apiKey?.includes('...');
  } catch {
    return false;
  }
};

const getLocal = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveLocal = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- MOCK DATA FOR PREVIEW ---
const injectMockData = (userId: string) => {
  const existingTx = getLocal<Transaction>('transactions');
  if (existingTx.length > 0) return;

  const mockClients: Client[] = [
    { id: 'c1', userId, name: 'MrBeast Gaming', platform: Platform.YOUTUBE, projectType: ProjectType.VIDEO_EDITING, notes: 'Fast-paced, high retention edits.', createdAt: Date.now() },
    { id: 'c2', userId, name: 'Luxe Aesthetics', platform: Platform.INSTAGRAM, projectType: ProjectType.GRAPHIC_DESIGN, notes: 'Minimalist brand style.', createdAt: Date.now() }
  ];

  const mockTxs: Transaction[] = [
    { id: 't1', userId, amount: 45000, type: TransactionType.INCOME, category: 'Video Editing', date: new Date().toISOString().split('T')[0], note: 'Monthly Retainer', clientId: 'c1' },
    { id: 't2', userId, amount: 15000, type: TransactionType.INCOME, category: 'Graphic Design', date: new Date().toISOString().split('T')[0], note: 'Thumbnail Pack', clientId: 'c2' },
    { id: 't3', userId, amount: 2499, type: TransactionType.EXPENSE, category: 'Software', date: new Date().toISOString().split('T')[0], note: 'Adobe Creative Cloud', clientId: undefined },
    { id: 't4', userId, amount: 1200, type: TransactionType.EXPENSE, category: 'Internet', date: new Date().toISOString().split('T')[0], note: 'Fiber Broadband', clientId: undefined }
  ];

  saveLocal('clients', mockClients);
  saveLocal('transactions', mockTxs);
};

export const dbService = {
  subscribeToClients(userId: string, callback: (clients: Client[]) => void) {
    if (!isFirebaseSetup()) {
      injectMockData(userId);
      callback(getLocal<Client>('clients').filter(c => c.userId === userId));
      return () => {};
    }
    const db = getFirestore();
    const q = query(collection(db, 'clients'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      callback(clients);
    });
  },

  async getClients(userId: string): Promise<Client[]> {
    if (!isFirebaseSetup()) {
      injectMockData(userId);
      return getLocal<Client>('clients').filter(c => c.userId === userId);
    }
    const db = getFirestore();
    const q = query(collection(db, 'clients'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  },

  async addClient(userId: string, clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const newClient = { ...clientData, userId, createdAt: Date.now(), id: crypto.randomUUID() };
    if (!isFirebaseSetup()) {
      const clients = getLocal<Client>('clients');
      clients.push(newClient);
      saveLocal('clients', clients);
      return newClient.id;
    }
    const db = getFirestore();
    const docRef = await addDoc(collection(db, 'clients'), { ...clientData, userId, createdAt: Date.now() });
    return docRef.id;
  },

  async deleteClient(userId: string, clientId: string): Promise<void> {
    if (!isFirebaseSetup()) {
      const clients = getLocal<Client>('clients').filter(c => c.id !== clientId);
      saveLocal('clients', clients);
      return;
    }
    const db = getFirestore();
    await deleteDoc(doc(db, 'clients', clientId));
  },

  subscribeToTransactions(userId: string, callback: (txs: Transaction[]) => void) {
    if (!isFirebaseSetup()) {
      injectMockData(userId);
      callback(getLocal<Transaction>('transactions').filter(t => t.userId === userId));
      return () => {};
    }
    const db = getFirestore();
    const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      callback(txs);
    });
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    if (!isFirebaseSetup()) {
      injectMockData(userId);
      return getLocal<Transaction>('transactions').filter(t => t.userId === userId);
    }
    const db = getFirestore();
    const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  },

  async addTransaction(userId: string, txData: Omit<Transaction, 'id' | 'userId'>): Promise<string> {
    const newTx = { ...txData, userId, id: crypto.randomUUID() };
    if (!isFirebaseSetup()) {
      const txs = getLocal<Transaction>('transactions');
      txs.push(newTx);
      saveLocal('transactions', txs);
      return newTx.id;
    }
    const db = getFirestore();
    const docRef = await addDoc(collection(db, 'transactions'), { ...txData, userId });
    return docRef.id;
  },

  async deleteTransaction(userId: string, txId: string): Promise<void> {
    if (!isFirebaseSetup()) {
      const txs = getLocal<Transaction>('transactions').filter(t => t.id !== txId);
      saveLocal('transactions', txs);
      return;
    }
    const db = getFirestore();
    await deleteDoc(doc(db, 'transactions', txId));
  },

  subscribeToCredentials(userId: string, callback: (creds: Credential[]) => void) {
    if (!isFirebaseSetup()) {
      callback(getLocal<Credential>('credentials').filter(c => c.userId === userId));
      return () => {};
    }
    const db = getFirestore();
    const q = query(collection(db, 'credentials'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const creds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Credential));
      callback(creds);
    });
  },

  async getCredentials(userId: string): Promise<Credential[]> {
    if (!isFirebaseSetup()) {
      return getLocal<Credential>('credentials').filter(c => c.userId === userId);
    }
    const db = getFirestore();
    const q = query(collection(db, 'credentials'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Credential));
  },

  async addCredential(userId: string, credData: Omit<Credential, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const newCred = { ...credData, userId, createdAt: Date.now(), id: crypto.randomUUID() };
    if (!isFirebaseSetup()) {
      const creds = getLocal<Credential>('credentials');
      creds.push(newCred);
      saveLocal('credentials', creds);
      return newCred.id;
    }
    const db = getFirestore();
    const docRef = await addDoc(collection(db, 'credentials'), { ...credData, userId, createdAt: Date.now() });
    return docRef.id;
  },

  async deleteCredential(userId: string, credId: string): Promise<void> {
    if (!isFirebaseSetup()) {
      const creds = getLocal<Credential>('credentials').filter(c => c.id !== credId);
      saveLocal('credentials', creds);
      return;
    }
    const db = getFirestore();
    await deleteDoc(doc(db, 'credentials', credId));
  }
};
