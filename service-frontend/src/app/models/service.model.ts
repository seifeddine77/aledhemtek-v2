export interface ServiceDto {
  id: number;
  name: string;
  description: string;
  price: number;
  img?: string; // Nom du fichier image uploadé
  returnedImage?: string; // Base64 encoded image
  processedImg?: string; // Optional property for the processed image URL
  categoryId?: number;
  categoryName?: string;
  tasks?: any[];
  // Add any other properties that come from the backend
}
