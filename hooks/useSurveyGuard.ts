// hooks/useSurveyGuard.ts
// Hook para verificar si el usuario ha completado la encuesta

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCompletedSurvey } from '../services/surveyService';

/**
 * Hook que redirige al usuario a la encuesta si no la ha completado
 */
export const useSurveyGuard = (): void => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!hasCompletedSurvey()) {
      navigate('/survey', { replace: true });
    }
  }, [navigate]);
};

