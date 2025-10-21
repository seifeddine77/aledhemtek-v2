export interface Evaluation {
  id?: number;
  reservationId: number;
  clientId: number;
  consultantId?: number;
  generalRating: number; // Note générale 1-5 stars
  serviceQualityRating: number; // Qualité du service
  punctualityRating: number; // Ponctualité
  communicationRating: number; // Communication
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number; // Calculé automatiquement
}

export interface EvaluationSummary {
  consultantId: number;
  consultantName: string;
  totalEvaluations: number;
  averageRating: number;
  averageServiceQuality: number;
  averagePunctuality: number;
  averageCommunication: number;
  recentComments: string[];
}
