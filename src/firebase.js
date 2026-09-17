import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBDZCkzMEqTQ7uV_fpikMvzvjRYHmcrGo4',
  authDomain: 'fir-realtime-test-cae38.firebaseapp.com',
  databaseURL: 'https://fir-realtime-test-cae38-default-rtdb.firebaseio.com',
  projectId: 'fir-realtime-test-cae38',
  storageBucket: 'fir-realtime-test-cae38.firebasestorage.app',
  messagingSenderId: '286007926431',
  appId: '1:286007926431:web:49d3e5de806d23b813ccaa',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const database = getDatabase(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
