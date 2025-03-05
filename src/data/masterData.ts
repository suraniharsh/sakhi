import { Symptom, Mood, SymptomCategory, MoodCategory } from '../types/symptoms';

export const symptoms: Symptom[] = [
  // Physical Symptoms
  { id: 'cramps', category: SymptomCategory.PHYSICAL, name: 'Cramps', severity: 2 },
  { id: 'bloating', category: SymptomCategory.PHYSICAL, name: 'Bloating', severity: 1 },
  { id: 'fatigue', category: SymptomCategory.PHYSICAL, name: 'Fatigue', severity: 2 },
  { id: 'headache', category: SymptomCategory.PAIN, name: 'Headache', severity: 2 },
  { id: 'backache', category: SymptomCategory.PAIN, name: 'Back Pain', severity: 2 },
  { id: 'breast_tenderness', category: SymptomCategory.PAIN, name: 'Breast Tenderness', severity: 1 },
  
  // Digestive Symptoms
  { id: 'nausea', category: SymptomCategory.DIGESTIVE, name: 'Nausea', severity: 2 },
  { id: 'appetite_changes', category: SymptomCategory.DIGESTIVE, name: 'Appetite Changes', severity: 1 },
  { id: 'constipation', category: SymptomCategory.DIGESTIVE, name: 'Constipation', severity: 2 },
  { id: 'diarrhea', category: SymptomCategory.DIGESTIVE, name: 'Diarrhea', severity: 2 },
  
  // Sleep Related
  { id: 'insomnia', category: SymptomCategory.SLEEP, name: 'Insomnia', severity: 3 },
  { id: 'oversleeping', category: SymptomCategory.SLEEP, name: 'Oversleeping', severity: 1 },
  { id: 'night_sweats', category: SymptomCategory.SLEEP, name: 'Night Sweats', severity: 2 },
  
  // Skin Related
  { id: 'acne', category: SymptomCategory.SKIN, name: 'Acne', severity: 1 },
  { id: 'oily_skin', category: SymptomCategory.SKIN, name: 'Oily Skin', severity: 1 },
  { id: 'dry_skin', category: SymptomCategory.SKIN, name: 'Dry Skin', severity: 1 },
  
  // Reproductive
  { id: 'spotting', category: SymptomCategory.REPRODUCTIVE, name: 'Spotting', severity: 2 },
  { id: 'heavy_flow', category: SymptomCategory.REPRODUCTIVE, name: 'Heavy Flow', severity: 3 },
  { id: 'light_flow', category: SymptomCategory.REPRODUCTIVE, name: 'Light Flow', severity: 1 },
  { id: 'clots', category: SymptomCategory.REPRODUCTIVE, name: 'Blood Clots', severity: 2 }
];

export const moods: Mood[] = [
  // Positive Moods
  { id: 'happy', category: MoodCategory.POSITIVE, name: 'Happy', intensity: 2 },
  { id: 'excited', category: MoodCategory.POSITIVE, name: 'Excited', intensity: 3 },
  { id: 'calm', category: MoodCategory.POSITIVE, name: 'Calm', intensity: 1 },
  { id: 'content', category: MoodCategory.POSITIVE, name: 'Content', intensity: 2 },
  
  // Negative Moods
  { id: 'sad', category: MoodCategory.NEGATIVE, name: 'Sad', intensity: 2 },
  { id: 'angry', category: MoodCategory.NEGATIVE, name: 'Angry', intensity: 3 },
  { id: 'irritated', category: MoodCategory.NEGATIVE, name: 'Irritated', intensity: 2 },
  { id: 'frustrated', category: MoodCategory.NEGATIVE, name: 'Frustrated', intensity: 2 },
  
  // Energy Levels
  { id: 'energetic', category: MoodCategory.ENERGY, name: 'Energetic', intensity: 3 },
  { id: 'tired', category: MoodCategory.ENERGY, name: 'Tired', intensity: 2 },
  { id: 'exhausted', category: MoodCategory.ENERGY, name: 'Exhausted', intensity: 3 },
  { id: 'lazy', category: MoodCategory.ENERGY, name: 'Lazy', intensity: 1 },
  
  // Anxiety Related
  { id: 'anxious', category: MoodCategory.ANXIETY, name: 'Anxious', intensity: 2 },
  { id: 'overwhelmed', category: MoodCategory.ANXIETY, name: 'Overwhelmed', intensity: 3 },
  { id: 'stressed', category: MoodCategory.ANXIETY, name: 'Stressed', intensity: 2 },
  { id: 'worried', category: MoodCategory.ANXIETY, name: 'Worried', intensity: 2 },
  
  // Depression Related
  { id: 'depressed', category: MoodCategory.DEPRESSION, name: 'Depressed', intensity: 3 },
  { id: 'hopeless', category: MoodCategory.DEPRESSION, name: 'Hopeless', intensity: 3 },
  { id: 'unmotivated', category: MoodCategory.DEPRESSION, name: 'Unmotivated', intensity: 2 },
  { id: 'lonely', category: MoodCategory.DEPRESSION, name: 'Lonely', intensity: 2 }
]; 