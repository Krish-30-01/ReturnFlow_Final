export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatWeight(weightKg: number): string {
  if (weightKg >= 1000) {
    return `${(weightKg / 1000).toFixed(1)} T`;
  }
  return `${weightKg.toLocaleString('en-IN')} Kg`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function getMatchScoreClass(score: number): {
  badgeClass: string;
  textClass: string;
  label: string;
} {
  if (score >= 80) {
    return { badgeClass: 'match-high', textClass: 'text-teal', label: 'High Match' };
  }
  if (score >= 60) {
    return { badgeClass: 'match-mid', textClass: 'text-amber', label: 'Good Match' };
  }
  return { badgeClass: 'match-low', textClass: 'text-secondary', label: 'Fair Match' };
}
