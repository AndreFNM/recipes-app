"use client";

import { useState } from "react";

interface ImageUploadProps {
  setImageUrl: (url: string | null) => void;
}

export default function ImageUpload({ setImageUrl }: ImageUploadProps): JSX.Element {
  const [message, setMessage] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successful upload. Image URL: ${data.filepath}`);
        setImageUrl(data.filepath || null);
      } else {
        setMessage(data.error || "Error uploading");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage("Error uploading");
    }
  };

  return (
    <div>
      <input 
       id="recipe-image"
       type="file" onChange={handleFileChange} />
      <p>{message}</p>
    </div>
  );
}
