import React, { useState } from 'react';
import axios from 'axios';
import './CreateRubric.css';

const CreateRubric = () => {
  const [rubricTitle, setRubricTitle] = useState('');
  const [rubricDescription, setRubricDescription] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [criteria, setCriteria] = useState([
    { criteriaName: '', description: '', maxPoints: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addCriterion = () => {
    setCriteria([...criteria, { criteriaName: '', description: '', maxPoints: 0 }]);
  };

  const removeCriterion = (index) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index, field, value) => {
    const updatedCriteria = criteria.map((criterion, i) =>
      i === index ? { ...criterion, [field]: value } : criterion
    );
    setCriteria(updatedCriteria);
  };

  const calculateTotalMarks = () => {
    return criteria.reduce((sum, criterion) => sum + parseFloat(criterion.maxPoints || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!rubricTitle.trim()) {
      setMessage('Rubric title is required');
      return;
    }

    if (criteria.some(c => !c.criteriaName.trim())) {
      setMessage('All criteria must have names');
      return;
    }

    const calculatedTotal = calculateTotalMarks();
    if (Math.abs(calculatedTotal - totalMarks) > 0.01) {
      setMessage(`Sum of criteria marks (${calculatedTotal}) must equal total marks (${totalMarks})`);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const rubricData = {
        title: rubricTitle,
        description: rubricDescription,
        totalMarks: parseFloat(totalMarks),
        criteria: criteria.map(c => ({
          criteriaName: c.criteriaName,
          description: c.description,
          maxPoints: parseFloat(c.maxPoints)
        }))
      };

      const response = await axios.post('http://localhost:8080/api/teacher/rubrics', rubricData);
      setMessage('Rubric created successfully!');

      // Reset form
      setRubricTitle('');
      setRubricDescription('');
      setTotalMarks(100);
      setCriteria([{ criteriaName: '', description: '', maxPoints: 0 }]);

    } catch (error) {
      console.error('Error creating rubric:', error);
      setMessage(error.response?.data || 'Failed to create rubric');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-rubric-container">
      <h2>Create Rubric</h2>

      <form onSubmit={handleSubmit} className="rubric-form">
        <div className="form-group">
          <label>Rubric Title *</label>
          <input
            type="text"
            value={rubricTitle}
            onChange={(e) => setRubricTitle(e.target.value)}
            placeholder="Enter rubric title"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={rubricDescription}
            onChange={(e) => setRubricDescription(e.target.value)}
            placeholder="Enter rubric description (optional)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Total Marks *</label>
          <input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
            required
          />
        </div>

        <div className="criteria-section">
          <h3>Criteria</h3>
          <p className="total-marks-info">
            Current total: <span className={Math.abs(calculateTotalMarks() - totalMarks) > 0.01 ? 'warning' : 'success'}>
              {calculateTotalMarks()}
            </span> / {totalMarks}
          </p>

          {criteria.map((criterion, index) => (
            <div key={index} className="criterion-item">
              <div className="criterion-header">
                <h4>Criterion {index + 1}</h4>
                {criteria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCriterion(index)}
                    className="remove-criterion-btn"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="criterion-fields">
                <div className="form-group">
                  <label>Criteria Name *</label>
                  <input
                    type="text"
                    value={criterion.criteriaName}
                    onChange={(e) => updateCriterion(index, 'criteriaName', e.target.value)}
                    placeholder="e.g., Logic, Code Quality, Output"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={criterion.description}
                    onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                    placeholder="Describe what this criterion evaluates"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Points *</label>
                  <input
                    type="number"
                    value={criterion.maxPoints}
                    onChange={(e) => updateCriterion(index, 'maxPoints', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addCriterion} className="add-criterion-btn">
            + Add Criterion
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating...' : 'Create Rubric'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateRubric;
