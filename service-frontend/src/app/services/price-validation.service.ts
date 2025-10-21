import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PriceValidationService {

  constructor() { }

  /**
   * Valide si un prix est valide (nombre positif)
   */
  isValidPrice(price: any): boolean {
    if (price === null || price === undefined) {
      return false;
    }

    const numericPrice = this.extractNumericPrice(price);
    return !isNaN(numericPrice) && numericPrice >= 0;
  }

  /**
   * Extrait le prix numérique d'un objet ou d'une valeur
   */
  extractNumericPrice(price: any): number {
    if (typeof price === 'number') {
      return price;
    }
    
    if (typeof price === 'object' && price !== null && price.totalPrice !== undefined) {
      return Number(price.totalPrice);
    }
    
    if (typeof price === 'string') {
      return parseFloat(price);
    }
    
    return NaN;
  }

  /**
   * Formate un prix pour l'affichage
   */
  formatPrice(price: any): string {
    const numericPrice = this.extractNumericPrice(price);
    
    if (isNaN(numericPrice)) {
      return 'Prix non disponible';
    }
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(numericPrice);
  }

  /**
   * Valide si une réponse de calcul de prix est valide
   */
  validatePriceResponse(response: any): { isValid: boolean; price: number; error?: string } {
    if (!response) {
      return { isValid: false, price: 0, error: 'Réponse vide du serveur' };
    }

    // Si c'est un objet avec totalPrice
    if (typeof response === 'object' && response.totalPrice !== undefined) {
      const price = Number(response.totalPrice);
      if (isNaN(price)) {
        return { isValid: false, price: 0, error: 'Prix invalide dans la réponse' };
      }
      return { isValid: true, price };
    }

    // Si c'est directement un nombre
    if (typeof response === 'number') {
      if (isNaN(response)) {
        return { isValid: false, price: 0, error: 'Prix numérique invalide' };
      }
      return { isValid: true, price: response };
    }

    return { isValid: false, price: 0, error: 'Format de réponse non reconnu' };
  }

  /**
   * Valide les quantités de tâches
   */
  validateTaskQuantities(taskQuantities: { [key: string]: number }): boolean {
    if (!taskQuantities || Object.keys(taskQuantities).length === 0) {
      return false;
    }

    return Object.values(taskQuantities).every(quantity => 
      typeof quantity === 'number' && quantity > 0 && Number.isInteger(quantity)
    );
  }

  /**
   * Valide les IDs de tâches
   */
  validateTaskIds(taskIds: number[]): boolean {
    if (!taskIds || taskIds.length === 0) {
      return false;
    }

    return taskIds.every(id => 
      typeof id === 'number' && id > 0 && Number.isInteger(id)
    );
  }

  /**
   * Crée un message d'erreur détaillé pour les problèmes de prix
   */
  createPriceErrorMessage(response: any, context: string = ''): string {
    const validation = this.validatePriceResponse(response);
    
    if (validation.isValid) {
      return '';
    }

    let message = `Erreur de calcul du prix`;
    if (context) {
      message += ` (${context})`;
    }
    message += `: ${validation.error}`;

    console.error('[PRICE VALIDATION ERROR]', {
      context,
      response,
      validation,
      responseType: typeof response
    });

    return message;
  }
}
