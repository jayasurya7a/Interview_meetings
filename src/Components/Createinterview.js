
import { useState, useEffect } from "react";
import Axios from "axios";

function Createinterview(){
    const [listOfUsers, setListOfUsers] = useState([]);
    const [selectedValues, setSelectedValues] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [scheduledInterviews, setScheduledInterviews] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/getUsers").then((response) => {
      setListOfUsers(response.data);
    });
  }, []);

  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((name) => name !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
  };

  const handleEndTimeChange = (event) => {
    setEndTime(event.target.value);
  };

  const isParticipantScheduled = (participant) => {
    const conflictingInterview = scheduledInterviews.find(
      (interview) => new Date(interview.startTime) <= new Date(endTime)
        && new Date(interview.endTime) >= new Date(startTime)
        && interview.participants.includes(participant)
    );
    return !!conflictingInterview;
  };

  const handleSubmit = () => {
    const unavailableParticipants = new Set();
    scheduledInterviews.forEach((interview) => {
      if (interview.startTime <= startTime && interview.endTime >= endTime) {
        interview.participants.forEach((participant) => {
          unavailableParticipants.add(participant);
        });
      }
    });

    const availableParticipants = listOfUsers.filter((item) => {
        return !unavailableParticipants.has(item.name);
      });

      Axios.post('/getInterviews', {
        participants: selectedValues,
        startTime,
        endTime
      })
        .then((response) => {
          console.log('Interview scheduled:', response.data);
          setScheduledInterviews([...scheduledInterviews, response.data]);
        })
        .catch((error) => {
          console.error('Error scheduling interview:', error);
        });
    };

    return (
        <div>
          <label>Select participants:</label>
          <select multiple value={selectedValues} onChange={handleSelectChange}>
            {listOfUsers.map((item) => {
              const unavailable = scheduledInterviews.some((interview) => {
                return (
                  interview.startTime <= startTime &&
                  interview.endTime >= endTime &&
                  interview.participants.includes(item.name)
                );
              });
              return (
                <option key={item._id} value={item.name} disabled={unavailable}>
                  {item.name}
                </option>
          );
        })}
      </select>
      <label>Select start time:</label>
      <input type="datetime-local" value={startTime} onChange={handleStartTimeChange} />
      <label>Select end time:</label>
      <input type="datetime-local" value={endTime} onChange={handleEndTimeChange} />
      <button onClick={handleSubmit}>Schedule interview</button>
      <h2>Participants:</h2>
      <ul>
        {listOfUsers.map((user) => (
          <li key={user._id}>
            {user.name} {isParticipantScheduled(user.name, startTime, endTime) && <span>(unavailable)</span>}
          </li>
        ))}
      </ul>
      <h2>Scheduled interviews:</h2>
      <ul>
        {scheduledInterviews.map((interview) => (
            <li key={interview._id}>
            <strong>Participants:</strong> {interview.participants.join(', ')} <br />
            <strong>Start time:</strong> {new Date(interview.startTime).toLocaleString()} <br />
            <strong>End time:</strong> {new Date(interview.endTime).toLocaleString()}
            </li>
                            ))}
            </ul>
            </div>
                    );
                };

export default Createinterview;