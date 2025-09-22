import React, { useState } from "react";
import { checkSoil } from "../api";

function SoilSensor() {
  const [data, setData] = useState({ moisture: 0, pH: 0, nitrogen: 0, phosphorus: 0, potassium: 0 });
  const [crop, setCrop] = useState("");

  const handleChange = (e) => setData({ ...data, [e.target.name]: parseFloat(e.target.value) });

  const submitData = async () => {
    const res = await checkSoil(data);
    setCrop(res.data.recommended_crop);
  };

  return (
    <div>
      <h2>Soil Fertility Check</h2>
      {Object.keys(data).map((key) => (
        <div key={key}>
          <label>{key}: </label>
          <input type="number" name={key} value={data[key]} onChange={handleChange} />
        </div>
      ))}
      <button onClick={submitData}>Check Crop</button>
      {crop && <h3>Recommended Crop: {crop}</h3>}
    </div>
  );
}

export default SoilSensor;
