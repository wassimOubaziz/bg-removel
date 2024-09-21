"use client";
import React, { useState, useCallback } from "react";
import { Sun, Moon, Upload, Trash, Download } from "lucide-react";
import ReactCompareImage from "react-compare-image";

const ImageUploadComponent = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      removeImage();
      setIsLoading(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("/api/removeBackground", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setProcessedImage(result.outputImage);
          setImage(URL.createObjectURL(file));
        } else {
          console.error("Failed to process image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const removeImage = useCallback(() => {
    setImage(null);
    setProcessedImage(null);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const downloadProcessedImage = useCallback(() => {
    if (processedImage) {
      const link = document.createElement("a");
      link.href = processedImage;
      link.download = "processed_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [processedImage]);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <nav className="w-full bg-purple-600 p-4 flex justify-between items-center">
        <h2 className="text-xl text-white font-bold">
          Background Removal Tool
        </h2>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-purple-700 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 text-yellow-300" />
          ) : (
            <Moon className="h-6 w-6 text-gray-300" />
          )}
        </button>
      </nav>

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      <div className="container mx-auto p-8 flex flex-col md:flex-row items-center gap-8 flex-grow">
        <div className="w-full md:w-1/3">
          <input
            className="hidden"
            type="file"
            id="input_file"
            onChange={(event) => {
              setCounter(counter + 1);
              handleImageUpload(event);
            }}
            accept="image/*"
          />
          <label
            htmlFor="input_file"
            className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg h-64 p-4 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <Upload className="w-12 h-12 mb-3 text-purple-500" />
            <span className="text-gray-500 text-center">
              Drag and drop your image here or click to upload
            </span>
          </label>
        </div>
        <div className="w-full md:w-2/3">
          {image && processedImage && (
            <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-xl">
              <ReactCompareImage
                leftImage={image}
                rightImage={processedImage}
                handle={
                  <div className="w-1 bg-white">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-purple-500 rounded-full shadow-lg flex items-center justify-center">
                      <span className="text-white text-lg">⇄</span>
                    </div>
                  </div>
                }
                sliderPositionPercentage={0.5}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={removeImage}
          className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 shadow-md"
          disabled={!image}
        >
          <Trash className="h-5 w-5" /> Remove Image
        </button>
        <button
          onClick={downloadProcessedImage}
          className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 shadow-md"
          disabled={!processedImage}
        >
          <Download className="h-5 w-5" /> Download Processed Image
        </button>
      </div>
      {/* alert you need to reload to preview other images */}
      {counter && (
        <div className="fixed bottom-4 right-4 p-4 bg-purple-500 text-white rounded-md shadow-md">
          <p className="text-sm">
            You need to reload the page to preview other images
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
