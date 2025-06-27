
import React from 'react';
import { NavItem } from './types';
import HomeIcon from './components/icons/HomeIcon';
import TrafficIcon from './components/icons/TrafficIcon';
import AlertsIcon from './components/icons/AlertsIcon';
import HistoryIcon from './components/icons/HistoryIcon';
import UploadIcon from './components/icons/UploadIcon';
import { ChartBarIcon } from '@heroicons/react/24/solid'; // Using heroicons for a better look

export const NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Inicio', path: '/', icon: <HomeIcon className="w-5 h-5" /> },
  { name: 'Tráfico en Vivo', path: '/traffic', icon: <TrafficIcon className="w-5 h-5" /> },
  { name: 'Clasificación y Alertas', path: '/classification', icon: <AlertsIcon className="w-5 h-5" /> },
  { name: 'Historial de Incidentes', path: '/history', icon: <HistoryIcon className="w-5 h-5" /> },
  { name: 'Métricas de Modelos', path: '/metrics', icon: <ChartBarIcon className="w-5 h-5" /> },
  { name: 'Subir CSV', path: '/upload', icon: <UploadIcon className="w-5 h-5" /> },
];

export const MOCK_MODEL_NAMES = ["SVM", "Decision Tree", "Random Forest", "Neural Network", "Naive Bayes"];
    