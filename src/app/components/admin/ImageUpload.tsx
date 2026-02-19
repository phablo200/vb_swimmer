"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onChange([...images, ...data.paths]);
      } else {
        alert(data.error || "Erro ao fazer upload");
      }
    } catch {
      alert("Erro de conexão ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-pink-500 bg-pink-50"
            : "border-gray-300 hover:border-pink-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600">Enviando imagens...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FiUpload className="text-gray-400" size={32} />
            <p className="text-sm text-gray-600">
              Arraste imagens aqui ou{" "}
              <span className="text-pink-600 font-medium">clique para selecionar</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP até 5MB</p>
          </div>
        )}
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
            >
              <Image
                src={src}
                alt={`Imagem ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={14} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 text-xs bg-pink-600 text-white px-2 py-0.5 rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
          {/* Add more placeholder */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-pink-400 hover:bg-gray-50 transition-colors"
          >
            <FiImage className="text-gray-400" size={24} />
            <span className="text-xs text-gray-400">Adicionar</span>
          </div>
        </div>
      )}
    </div>
  );
}
