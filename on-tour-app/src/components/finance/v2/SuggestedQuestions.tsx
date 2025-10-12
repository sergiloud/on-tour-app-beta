import React from 'react';
import { t } from '../../../lib/i18n';
import { trackEvent } from '../../../lib/telemetry';

interface SuggestedQuestion {
  id: string;
  question: string;
  filter: { kind: 'Region'|'Agency'|'Country'|'Promoter'|'Route'|'Aging'; value: string };
}

interface SuggestedQuestionsProps {
  onFilterChange: (filter: { kind: 'Region'|'Agency'|'Country'|'Promoter'|'Route'|'Aging'; value: string }) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onFilterChange }) => {
  const questions: SuggestedQuestion[] = [
    {
      id: 'profitable-country',
      question: t('finance.questions.profitableCountry') || '¿Cuál es mi país más rentable?',
      filter: { kind: 'Country', value: 'top' }
    },
    {
      id: 'confirmed-vs-offers',
      question: t('finance.questions.confirmedVsOffers') || '¿Cómo se comparan los shows confirmados vs. las ofertas?',
      filter: { kind: 'Agency', value: 'status' }
    },
    {
      id: 'commission-percentage',
      question: t('finance.questions.commissionPercentage') || '¿Qué porcentaje de mis ingresos se va en comisiones?',
      filter: { kind: 'Promoter', value: 'commission' }
    },
    {
      id: 'route-performance',
      question: t('finance.questions.routePerformance') || '¿Cómo performan mis diferentes rutas de tour?',
      filter: { kind: 'Route', value: 'performance' }
    }
  ];

  const handleQuestionClick = (question: SuggestedQuestion) => {
    trackEvent('finance.question.click', {
      questionId: question.id,
      question: question.question
    });
    onFilterChange(question.filter);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium opacity-90">
        {t('finance.questions.title') || 'Preguntas Sugeridas'}
      </h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question.id}
            className="px-3 py-2 text-sm rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-left"
            onClick={() => handleQuestionClick(question)}
          >
            {question.question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;