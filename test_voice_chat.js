// Test voice chat functionality
console.log('🎤 Voice Chat Assistant Test');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('✅ Browser environment detected');
  
  // Check for speech recognition support
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    console.log('✅ Speech recognition supported');
  } else {
    console.log('❌ Speech recognition not supported');
  }
  
  // Check for speech synthesis support
  if ('speechSynthesis' in window) {
    console.log('✅ Speech synthesis supported');
    
    // Test speech synthesis
    const utterance = new SpeechSynthesisUtterance('Hello! This is a test of the voice chat assistant.');
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    console.log('🔊 Testing speech synthesis...');
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      console.log('✅ Speech synthesis test completed');
    };
    
    utterance.onerror = (event) => {
      console.log('❌ Speech synthesis error:', event.error);
    };
    
  } else {
    console.log('❌ Speech synthesis not supported');
  }
  
} else {
  console.log('❌ Not in browser environment - voice chat requires browser APIs');
}

console.log('🎯 Voice chat test completed!');
