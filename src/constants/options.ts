/**
 * Shared constants for role and sort options
 */

import { FileText, AlertCircle, Handshake, TrendingUp, Sparkles, Clock } from 'lucide-react';
import type { RoleOption, SortOption } from '../types';

export const ROLE_OPTIONS: RoleOption[] = [
  { id: 'underwriting', label: 'Underwriting', icon: FileText },
  { id: 'claims', label: 'Claims', icon: AlertCircle },
  { id: 'brokerage', label: 'Brokerage', icon: Handshake },
  { id: 'actuarial', label: 'Actuarial', icon: TrendingUp },
];

export const SORT_OPTIONS: SortOption[] = [
  { id: 'smart', label: 'AI Sort (AI + Recency)', icon: Sparkles },
  { id: 'recency', label: 'Recent', icon: Clock },
];

