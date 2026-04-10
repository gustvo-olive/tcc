import React, { useState } from 'react';
import Modal from './Modal';

const TUTORIAL_STEPS = [
    {
        title: "Bem-vindo ao CanvasLab 🧪",
        content: "O CanvasLab é o seu laboratório prático. Aqui você vai investigar hipóteses estatísticas como um cientista de dados, combinando a extração de dados, testes lógicos e interpretações."
    },
    {
        title: "Ferramentas do Painel 🛠️",
        content: "No painel da esquerda estão todas as suas ferramentas. Basta clicar em um botão para levar um bloco para a área de montagem. Os blocos estão divididos por fases (Exploração, Pressupostos, Inferência, etc)."
    },
    {
        title: "Conectando o Fluxo 🔗",
        content: "Para que a análise aconteça, é preciso ligar os blocos na ordem certa. Clique e segure na 'bolinha' de saída de um bloco e arraste até a entrada do próximo."
    },
    {
        title: "Investigações Profundas 🔍",
        content: "Muitos blocos de ação possuem um botão de engrenagem (⚙️) que aparece dentro deles. Clique nessa engrenagem para abrir tabelas, ver gráficos de distribuição e conferir os p-valores de testes estatísticos."
    },
    {
        title: "Validando o Rigor 🚀",
        content: "Depois que ligar tudo, indo desde a base de dados até o bloco de Fim (Aceitar ou Rejeitar), clique no botão verde '🚀 Validar' lá no canto superior direito para rodar o motor e ver se você escolheu o caminho certo!"
    }
];

const CanvasTutorial = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    return (
        <>
            <button 
                onClick={() => { setCurrentStep(0); setIsOpen(true); }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  transition: 'background 0.2s, transform 0.2s',
                  position: 'absolute',
                  bottom: '25px',
                  right: '25px', // Canto inferior direito para chamar atenção fora do painel
                  zIndex: 999
                }}
                title="Tutorial do CanvasLab"
                onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
                ❓
            </button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Tutorial do CanvasLab">
                <div style={{ padding: '20px', minHeight: '180px', display: 'flex', flexDirection: 'column', color: '#334155' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '15px', color: '#6366f1', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
                            Passo {currentStep + 1} de {TUTORIAL_STEPS.length}
                        </div>
                        <h3 style={{ color: '#1e293b', marginTop: 0, fontSize: '22px' }}>
                            {TUTORIAL_STEPS[currentStep].title}
                        </h3>
                        <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6' }}>
                            {TUTORIAL_STEPS[currentStep].content}
                        </p>
                    </div>

                    {/* Controles do Carrossel */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                        <button 
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            style={{
                                padding: '8px 16px',
                                background: currentStep === 0 ? '#f1f5f9' : '#e2e8f0',
                                color: currentStep === 0 ? '#cbd5e1' : '#475569',
                                border: 'none', borderRadius: '4px', cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Anterior
                        </button>
                        
                        {/* Indicadores Visuais (Dots) */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {TUTORIAL_STEPS.map((_, index) => (
                                <div 
                                    key={index} 
                                    title={`Ir para o passo ${index + 1}`}
                                    onClick={() => setCurrentStep(index)}
                                    style={{
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        cursor: 'pointer', transition: 'background 0.3s',
                                        background: index === currentStep ? '#6366f1' : '#cbd5e1'
                                    }}
                                />
                            ))}
                        </div>

                        {currentStep < TUTORIAL_STEPS.length - 1 ? (
                            <button 
                                onClick={nextStep}
                                style={{
                                    padding: '8px 20px',
                                    background: '#3b82f6', color: 'white',
                                    border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Próximo
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsOpen(false)}
                                style={{
                                    padding: '8px 20px',
                                    background: '#10b981', color: 'white',
                                    border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Concluir
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CanvasTutorial;
