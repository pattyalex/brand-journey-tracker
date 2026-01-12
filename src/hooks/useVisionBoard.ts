import { useState, useEffect } from 'react';
import { StorageKeys, getString, setString } from '@/lib/storage';

export interface VisionBoardData {
  images: string[];
  pinterestUrl: string;
}

export const useVisionBoard = () => {
  const [images, setImages] = useState<string[]>(() => {
    const saved = getString(StorageKeys.visionBoardData);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.images || [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [pinterestUrl, setPinterestUrl] = useState<string>(() => {
    const saved = getString(StorageKeys.visionBoardData);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.pinterestUrl || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      const data: VisionBoardData = {
        images,
        pinterestUrl
      };
      const dataString = JSON.stringify(data);

      // Check approximate size (2 bytes per character in JavaScript strings)
      const sizeInBytes = new Blob([dataString]).size;
      if (sizeInBytes > 4 * 1024 * 1024) { // 4MB limit
        throw new Error('Data too large for localStorage');
      }

      setString(StorageKeys.visionBoardData, dataString);
    } catch (error) {
      // localStorage quota exceeded
      console.error('Failed to save vision board data:', error);
      throw error; // Re-throw so the calling code can handle it
    }
  }, [images, pinterestUrl]);

  const addImage = (imageUrl: string) => {
    try {
      const newImages = [...images, imageUrl];
      const testData = JSON.stringify({ images: newImages, pinterestUrl });
      const sizeInBytes = new Blob([testData]).size;

      if (sizeInBytes > 4 * 1024 * 1024) { // 4MB limit
        throw new Error('Storage limit would be exceeded');
      }

      setImages(newImages);
      return true;
    } catch (error) {
      console.error('Failed to add image:', error);
      return false;
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const updatePinterestUrl = (url: string) => {
    setPinterestUrl(url);
  };

  return {
    images,
    pinterestUrl,
    addImage,
    removeImage,
    updatePinterestUrl,
    setImages,
    setPinterestUrl
  };
};
