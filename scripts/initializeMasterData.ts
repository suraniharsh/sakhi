import { db } from '../src/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { symptoms, moods } from '../src/data/masterData';

async function initializeMasterData() {
  try {
    // Initialize symptoms
    await setDoc(doc(db, 'symptoms', 'master'), {
      items: symptoms,
      lastUpdated: new Date()
    });
    console.log('✅ Symptoms initialized successfully');

    // Initialize moods
    await setDoc(doc(db, 'moods', 'master'), {
      items: moods,
      lastUpdated: new Date()
    });
    console.log('✅ Moods initialized successfully');

  } catch (error) {
    console.error('❌ Error initializing master data:', error);
  }
}

// Run the initialization
initializeMasterData(); 