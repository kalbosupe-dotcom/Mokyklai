import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, XCircle } from 'lucide-react';

export default function DyslexiaTextSimplifier() {
  const [originalText, setOriginalText] = useState('');
  const [simplifiedParagraphs, setSimplifiedParagraphs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const processText = async () => {
    if (!originalText.trim()) {
      alert('Prašome įvesti tekstą');
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);
    setAnswers({});
    setShowResults({});

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `Tu esi mokymo asistentas septintokui disleksikui. SVARBU: Mokinys yra protingas, tiesiog vargsta su per ilgais ir sudėtingais sakiniais.

Tavo užduotis:

1. Perskaityti šį vadovėlio tekstą
2. Pritaikyti jį disleksijai (NE supaprastinti žodyną!):
   - Trumpesni sakiniai (8-12 žodžių vietoje 20-30)
   - Išlaikyti svarbius terminus ir žodyną iš vadovėlio
   - Aiškiai struktūruoti informaciją
   - Palikti VISĄ svarbią informaciją, ne tik esminius dalykus
   - Suskaidyti sudėtingus sakinius į kelis trumpesnius
3. Išskirstyti į 3-4 sakinių pastraipas (gali būti 7-12 pastraipų, priklausomai nuo teksto ilgio)
4. Kiekvienai pastraipai sukurti 2-3 testo klausimus su 3 atsakymo variantais:
   - 1 aiškiai teisingas atsakymas
   - 2 AIŠKIAI neteisingi atsakymai (ne artimi teisingam, o visiškai kitokie)

SVARBU: Atsakyk TIKTAI JSON formatu, be jokių papildomų žodžių ar markdown žymių.

KLAUSIMAI: Neteisingi atsakymai turi būti VISIŠKAI neteisingi, ne "beveik teisingi". Pvz.:
- Klausimas: "Ką gamino amatininkai?"
- ✅ Teisingas: "Puodus, baldus ir drabužius"
- ❌ BLOGAI neteisingas: "Baldus ir įrankius" (per panašus!)
- ✅ GERAI neteisingas: "Augino javus ir gyvulius" (visai kita veikla)
- ✅ GERAI neteisingas: "Mokė vaikus skaityti" (visai kita veikla)

JSON struktūra:
{
  "paragraphs": [
    {
      "text": "Supaprastintas tekstas 3-4 sakiniai",
      "questions": [
        {
          "question": "Klausimas?",
          "options": ["Variantas A", "Variantas B", "Variantas C"],
          "correct": 0
        }
      ]
    }
  ]
}

TEKSTAS:
${originalText}`
          }]
        })
      });

      const data = await response.json();
      let content = data.content.find(item => item.type === 'text')?.text || '';
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(content);
      setSimplifiedParagraphs(parsed.paragraphs);
    } catch (error) {
      console.error('Klaida apdorojant tekstą:', error);
      alert('Įvyko klaida. Bandykite dar kartą.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnswer = (paragraphIndex, questionIndex, selectedOption) => {
    const key = `${paragraphIndex}-${questionIndex}`;
    setAnswers(prev => ({
      ...prev,
      [key]: selectedOption
    }));
  };

  const checkAnswers = (paragraphIndex) => {
    const paragraph = simplifiedParagraphs[paragraphIndex];
    let allCorrect = true;

    paragraph.questions.forEach((q, qIndex) => {
      const key = `${paragraphIndex}-${qIndex}`;
      if (answers[key] !== q.correct) {
        allCorrect = false;
      }
    });

    setShowResults(prev => ({
      ...prev,
      [paragraphIndex]: true
    }));

    return allCorrect;
  };

  const nextParagraph = () => {
    if (currentIndex < simplifiedParagraphs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevParagraph = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentParagraph = simplifiedParagraphs[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-indigo-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">
              Tekstų Supaprastintojas
            </h1>
          </div>
          <p className="text-gray-600 mb-4">
            Įklijuok vadovėlio tekstą ir jis bus supaprastintas lengvesniam skaitymui 📚
          </p>

          {simplifiedParagraphs.length === 0 ? (
            <div>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Įklijuok tekstą iš vadovėlio čia..."
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                style={{ lineHeight: '1.8' }}
              />
              <button
                onClick={processText}
                disabled={isProcessing}
                className="mt-4 w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
              >
                {isProcessing ? '⏳ Apdorojama...' : '✨ Supaprastinti tekstą'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setSimplifiedParagraphs([]);
                setOriginalText('');
                setCurrentIndex(0);
                setAnswers({});
                setShowResults({});
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              📝 Pradėti iš naujo
            </button>
          )}
        </div>

        {simplifiedParagraphs.length > 0 && currentParagraph && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-4 py-2 rounded-full">
                Pastraipa {currentIndex + 1} iš {simplifiedParagraphs.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={prevParagraph}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextParagraph}
                  disabled={currentIndex === simplifiedParagraphs.length - 1}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div 
              className="text-xl leading-relaxed mb-8 p-6 bg-blue-50 rounded-xl"
              style={{ 
                fontFamily: 'OpenDyslexic, Arial, sans-serif',
                lineHeight: '2',
                letterSpacing: '0.5px'
              }}
            >
              {currentParagraph.text}
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ✅ Patikrink supratimą
              </h3>

              {currentParagraph.questions.map((q, qIndex) => {
                const key = `${currentIndex}-${qIndex}`;
                const isAnswered = showResults[currentIndex];
                const selectedAnswer = answers[key];
                const isCorrect = selectedAnswer === q.correct;

                return (
                  <div key={qIndex} className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-lg mb-3 text-gray-800">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => {
                        const isSelected = selectedAnswer === optIndex;
                        const isCorrectOption = optIndex === q.correct;
                        
                        let bgColor = 'bg-white hover:bg-gray-100';
                        let borderColor = 'border-gray-300';
                        let icon = null;

                        if (isAnswered) {
                          if (isCorrectOption) {
                            bgColor = 'bg-green-100';
                            borderColor = 'border-green-500';
                            icon = <CheckCircle className="text-green-600" size={20} />;
                          } else if (isSelected && !isCorrect) {
                            bgColor = 'bg-red-100';
                            borderColor = 'border-red-500';
                            icon = <XCircle className="text-red-600" size={20} />;
                          }
                        } else if (isSelected) {
                          bgColor = 'bg-indigo-100';
                          borderColor = 'border-indigo-500';
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() => !isAnswered && handleAnswer(currentIndex, qIndex, optIndex)}
                            disabled={isAnswered}
                            className={`w-full text-left p-4 border-2 ${borderColor} ${bgColor} rounded-lg transition-all flex items-center justify-between ${!isAnswered && 'cursor-pointer'}`}
                          >
                            <span className="text-lg">{option}</span>
                            {icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!showResults[currentIndex] ? (
                <button
                  onClick={() => checkAnswers(currentIndex)}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors"
                >
                  ✓ Patikrinti atsakymus
                </button>
              ) : (
                <div className="text-center p-4 bg-green-100 rounded-xl">
                  <p className="text-lg font-semibold text-green-800">
                    ✨ Puiku! Dabar gali pereiti prie kitos pastraipos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {simplifiedParagraphs.length > 0 && (
          <div className="mt-4 bg-white rounded-xl p-4 shadow">
            <div className="flex gap-2 justify-center">
              {simplifiedParagraphs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-indigo-600 w-8' 
                      : showResults[index]
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}