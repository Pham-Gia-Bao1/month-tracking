
import { CategoryColor } from '../types';

export const COLOR_MAP: Record<CategoryColor, { bg: string; text: string; border: string; progress: string; light: string }> = {
  red:    { bg: '#FFF1EE', text: '#C4533A', border: '#F5D5CC', progress: '#C4533A', light: '#F5EAE7' },
  blue:   { bg: '#EEF4FF', text: '#3A7CC4', border: '#CCDdF5', progress: '#3A7CC4', light: '#E7EFF5' },
  green:  { bg: '#EEF9F4', text: '#3A9C6E', border: '#CCECDd', progress: '#3A9C6E', light: '#E7F5EE' },
  gold:   { bg: '#FFF8EE', text: '#C49A3A', border: '#F5E8CC', progress: '#C49A3A', light: '#F5F0E7' },
  purple: { bg: '#F4EEFF', text: '#7A3AC4', border: '#DdCCF5', progress: '#7A3AC4', light: '#EEE7F5' },
  pink:   { bg: '#FFF0F5', text: '#C43A7A', border: '#F5CCDd', progress: '#C43A7A', light: '#F5E7EE' },
  teal:   { bg: '#EEFAF9', text: '#3AA8A0', border: '#CCEDE9', progress: '#3AA8A0', light: '#E7F4F3' },
  orange: { bg: '#FFF5EE', text: '#C47A3A', border: '#F5E0CC', progress: '#C47A3A', light: '#F5EEE7' },
};

export const COLOR_OPTIONS: CategoryColor[] = ['red', 'blue', 'green', 'gold', 'purple', 'pink', 'teal', 'orange'];

export const COLOR_LABELS: Record<CategoryColor, string> = {
  red: 'Coral', blue: 'Ocean', green: 'Sage', gold: 'Gold',
  purple: 'Violet', pink: 'Rose', teal: 'Teal', orange: 'Amber',
};
