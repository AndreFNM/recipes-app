"use client";
import { useState } from 'react';

export default function ImageUpload({ setImageUrl }) {  
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Successful upload. Image URL: ${data.filepath}`);
        setImageUrl(data.filepath); 
      } else {
        setMessage(data.error || 'Error uploading');
      }
    } catch (error) {
      setMessage('Error uploading');
    }
  };
  

  return (
    <>
    
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Image</button>
        <p>{message}</p>
      
    </>
  );
}
