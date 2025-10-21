import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly baseUrl = 'http://localhost:8080/uploads';
  private readonly defaultImages = {
    task: 'assets/images/default-task.png',
    service: 'assets/images/default-service.png',
    category: 'assets/images/default-category.png',
    profile: 'assets/images/default-profile.png'
  };

  constructor() { }

  /**
   * Génère l'URL complète pour une image
   * @param imageName - Nom de l'image (peut contenir ou non le préfixe du dossier)
   * @param type - Type d'image (task, service, category, profile)
   * @returns URL complète de l'image ou image par défaut
   */
  getImageUrl(imageName: string | undefined, type: 'task' | 'service' | 'category' | 'profile'): string {
    if (!imageName) {
      return this.getDefaultImage(type);
    }

    // Nettoyer le nom de l'image (supprimer le préfixe s'il existe)
    const cleanImageName = this.cleanImageName(imageName, type);
    
    // Construire l'URL complète
    return `${this.baseUrl}/${this.getFolder(type)}/${cleanImageName}`;
  }

  /**
   * Nettoie le nom de l'image en supprimant les préfixes parasites
   */
  private cleanImageName(imageName: string, type: 'task' | 'service' | 'category' | 'profile'): string {
    const folder = this.getFolder(type);
    const prefix = `${folder}/`;
    
    // Supprimer le préfixe s'il existe
    if (imageName.startsWith(prefix)) {
      return imageName.substring(prefix.length);
    }
    
    return imageName;
  }

  /**
   * Retourne le dossier correspondant au type d'image
   */
  private getFolder(type: 'task' | 'service' | 'category' | 'profile'): string {
    switch (type) {
      case 'task': return 'tasks';
      case 'service': return 'services';
      case 'category': return 'categories';
      case 'profile': return 'profile-pictures';
      default: return 'tasks';
    }
  }

  /**
   * Retourne l'image par défaut pour un type donné
   */
  private getDefaultImage(type: 'task' | 'service' | 'category' | 'profile'): string {
    return this.defaultImages[type] || this.defaultImages.task;
  }

  /**
   * Vérifie si une URL d'image est valide
   */
  isValidImageUrl(url: string): boolean {
    return !!(url && url.trim().length > 0 && !url.includes('default-'));
  }

  /**
   * Formate le nom d'image pour la sauvegarde (sans préfixe)
   */
  formatImageNameForSave(imageName: string, type: 'task' | 'service' | 'category' | 'profile'): string {
    return this.cleanImageName(imageName, type);
  }
}
