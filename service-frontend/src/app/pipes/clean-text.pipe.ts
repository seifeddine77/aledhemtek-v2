import { Pipe, PipeTransform } from '@angular/core';

export function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/R\?\?paration/g, 'Réparation')
    .replace(/r\?\?paration/g, 'réparation')
    .replace(/R\?\?novation/g, 'Rénovation')
    .replace(/r\?\?novation/g, 'rénovation')
    .replace(/D\?\?tecter/g, 'Détecter')
    .replace(/d\?\?tecter/g, 'détecter')
    .replace(/encastr\?\?e/g, 'encastrée')
    .replace(/encastr\?\?/g, 'encastré')
    .replace(/d'\?\?tanch\?\?it\?\?/g, "d'étanchéité")
    .replace(/\?\?tanch\?\?it\?\?/g, 'étanchéité')
    .replace(/c\?\?ramique/g, 'céramique')
    .replace(/m\?\?canique/g, 'mécanique')
    .replace(/d\?\?sint\?\?grer/g, 'désintégrer')
    .replace(/diff\?\?rentiel/g, 'différentiel')
    .replace(/Per\?\?age/g, 'Perçage')
    .replace(/per\?\?age/g, 'perçage')
    .replace(/s\?\?curis\?\?e/g, 'sécurisée')
    .replace(/s\?\?curis\?\?/g, 'sécurisé')
    .replace(/\?\?lectrique/g, 'électrique')
    .replace(/\?\?vier/g, 'évier')
    .replace(/mat\?\?riaux/g, 'matériaux')
    .replace(/mat\?\?riel/g, 'matériel')
    .replace(/g\?\?n\?\?ral/g, 'général')
    .replace(/G\?\?n\?\?ral/g, 'Général')
    .replace(/\?\?/g, 'é');
}

@Pipe({
  name: 'cleanText',
  standalone: true
})
export class CleanTextPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return cleanText(value);
  }
}
