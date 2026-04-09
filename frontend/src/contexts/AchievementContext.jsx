import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const AchievementContext = createContext();

export const useAchievement = () => useContext(AchievementContext);

const BADGE_DB = [
  { id: 'FIRST_LOGIN', title: 'Primeiros Passos', desc: 'Acessou o sistema pela primeira vez.', icon: '👋' },
  { id: 'MISSION_1_COMPLETE', title: 'O Primeiro Contato', desc: 'Superou a missão de análise básica estatística e N.', icon: '🎲' },
  { id: 'MISSION_2_COMPLETE', title: 'Curva Normal', desc: 'Entendeu e executou testes de aderência com Kolmogorov/Shapiro.', icon: '📈' },
  { id: 'MISSION_6_COMPLETE', title: 'Mestre da Investigação', desc: 'Passou pelo Desafio Final (Modo PBL Ativo).', icon: '🧠' },
  { id: 'THEORY_READER', title: 'Mente Erudita', desc: 'Acessou o conteúdo teórico base para se precaver antes da prática.', icon: '📖' }
];

export const AchievementProvider = ({ children }) => {
  const toast = useToast();
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('@TCC:unlockedBadges');
    if (saved) {
      try {
        setUnlockedBadges(JSON.parse(saved));
      } catch(e) {
        setUnlockedBadges([]);
      }
    } else {
      // Iniciar destravando o First login se for a primeira vez
      unlockBadge('FIRST_LOGIN');
    }
  }, []);

  const unlockBadge = useCallback((badgeId) => {
    setUnlockedBadges(prev => {
      if (prev.includes(badgeId)) return prev; // já desbloqueou

      const novoArray = [...prev, badgeId];
      localStorage.setItem('@TCC:unlockedBadges', JSON.stringify(novoArray));
      
      const badgeSpecs = BADGE_DB.find(b => b.id === badgeId);
      if (badgeSpecs) {
         toast.achievement(`Conquista Desbloqueada: ${badgeSpecs.title}`, 6000);
      }
      return novoArray;
    });
  }, [toast]);

  const resetBadges = () => {
    localStorage.removeItem('@TCC:unlockedBadges');
    setUnlockedBadges([]);
    toast.info("Conquistas zeradas.", 2000);
  };

  const isUnlocked = (badgeId) => unlockedBadges.includes(badgeId);

  const getFullBadgeData = () => {
    return BADGE_DB.map(b => ({
      ...b,
      unlocked: unlockedBadges.includes(b.id)
    }));
  };

  return (
    <AchievementContext.Provider value={{ unlockedBadges, unlockBadge, isUnlocked, getFullBadgeData, resetBadges }}>
      {children}
    </AchievementContext.Provider>
  );
};
