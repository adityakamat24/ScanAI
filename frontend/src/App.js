import React, { useState, useRef } from 'react';
import axios from 'axios';

const App = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const [userProfile, setUserProfile] = useState({
    age: '',
    allergies: [],
    conditions: []
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) {
      alert("Please upload a product label image first.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const res = await axios.post('http://localhost:5000/api/analyze', {
        imageData: image,
        profile: userProfile
      });

      setAnalysis(res.data);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setUserProfile((prev) => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setUserProfile((prev) => ({
        ...prev,
        conditions: [...prev.conditions, conditionInput.trim()]
      }));
      setConditionInput('');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>SafeFood Analyzer</h1>

      <div>
        <label>Age:</label>
        <input
          type="number"
          value={userProfile.age}
          onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })}
        />
      </div>

      <div>
        <label>Add Allergy:</label>
        <input
          type="text"
          value={allergyInput}
          onChange={(e) => setAllergyInput(e.target.value)}
        />
        <button onClick={addAllergy}>Add</button>
        <div>Current: {userProfile.allergies.join(', ')}</div>
      </div>

      <div>
        <label>Add Condition:</label>
        <input
          type="text"
          value={conditionInput}
          onChange={(e) => setConditionInput(e.target.value)}
        />
        <button onClick={addCondition}>Add</button>
        <div>Current: {userProfile.conditions.join(', ')}</div>
      </div>

      <br />
      <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
      <br />

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      <br /><br />
      {analysis && (
        <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '1rem' }}>
          <strong>Result:</strong>
          <br />
          {analysis}
        </div>
      )}
    </div>
  );
};

export default App;
