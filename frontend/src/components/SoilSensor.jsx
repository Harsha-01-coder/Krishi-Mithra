import React, { useState } from "react";
import axios from "axios";

function SoilSensor() {
  const [city, setCity] = useState("");
  const [moisture, setMoisture] = useState("");
  const [ph, setPh] = useState("");
  const [data, setData] = useState(null);

  const submitSoil = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/soil", { city, moisture, pH: ph });
      setData(res.data);
    } catch {
      alert("Error submitting soil data");
    }
  };

  return (
    <div>
      <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
      <input placeholder="Moisture (%)" value={moisture} onChange={(e) => setMoisture(e.target.value)} />
      <input placeholder="pH" value={ph} onChange={(e) => setPh(e.target.value)} />
      <button onClick={submitSoil}>Submit</button>
      {data && (
        <div>
          <p>Recommended Crops: {data.recommended_crops.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default SoilSensor;
