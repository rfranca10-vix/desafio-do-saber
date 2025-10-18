import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ------------------------------------------------------------
// DESAFIO DO SABER — Protótipo Web (React + Tailwind + Framer Motion)
// + Banco de questões (IFES/ENEM, letra A/B/C/D)
// + SONS (WebAudio) e RANKING (localStorage)
// + IMPORTAÇÃO de CSV/JSON (arquivo local ou URL CSV — ex.: Google Sheets publicado)
// ------------------------------------------------------------

const AVATARS = [
  { id: "Zé",  name: "Zé Descolado", emoji: "🛹", tagline: "Mano, tu tá voando!" },
  { id: "Kako", name: "Kako Nerd",     emoji: "🤓", tagline: "Excelência detectada!" },
  { id: "Luna", name: "Luna Criativa",  emoji: "🎨", tagline: "Pintou acerto!" },
  { id: "Bia",  name: "Bia Determinada",emoji: "🏃‍♀️", tagline: "Foco e força!" },
];

// --- SFX (sons) -------------------------------------------------
function useSFX() {
  const ctxRef = useRef(null);
  function ensureCtx() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  }
  function beep({ freq = 880, duration = 0.12, type = "sine", volume = 0.2 }) {
    const ctx = ensureCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = volume; o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    o.stop(ctx.currentTime + duration);
  }
  return {
    correct() { beep({ freq: 1046, type: "triangle" }); setTimeout(() => beep({ freq: 1318, type: "triangle" }), 110); },
    wrong()   { beep({ freq: 180,  type: "sawtooth" }); },
    medal()   { beep({ freq: 740,  type: "square"  }); setTimeout(() => beep({ freq: 880, type: "square" }), 120); setTimeout(() => beep({ freq: 988, type: "square" }), 240); },
  };
}

const MOTIVATIONAL = [
  "Mandou bem! 🚀",
  "A NASA tá te observando 👀",
  "Acerto com estilo! ✨",
  "Curva do aprendizado subindo! 📈",
];

const FUNNY_WRONG = [
  "Vai estudar mais e volte amanhã… 😅",
  "Quase! Essa passou raspando. 🪒",
  "Nem o Caio Nerd sabia essa (mentira, sabia sim) 😂",
  "Errar faz parte do esporte. Bora pra próxima! 🏃",
];

// Medalhas simbólicas
function Medal({ index }) {
  const palette = [
    "from-amber-400 to-yellow-600",
    "from-zinc-400 to-zinc-600",
    "from-yellow-300 to-yellow-500",
    "from-sky-300 to-sky-600",
  ];
  const color = palette[Math.min(index, palette.length - 1)];
  return (
    <div className={`w-20 h-20 rounded-full bg-gradient-to-b ${color} shadow-xl border-4 border-white flex items-center justify-center text-xl font-bold text-white`}>🏅</div>
  );
}

function Chip({ children }) {
  return (
    <span className="px-2 py-1 rounded-full bg-slate-800/80 text-white text-xs font-medium">
      {children}
    </span>
  );
}

// Banco de questões (20 demo — 10 IFES + 10 ENEM) com resposta como letra
const QUESTIONS = {
  IFES: [
    {"mode":"IFES","id":"IFES-001","year":2023,"subject":"Matemática","difficulty":"fácil","stem":"A área de um triângulo de base 12 cm e altura 8 cm é igual a:","option_a":"24 cm²","option_b":"32 cm²","option_c":"48 cm²","option_d":"96 cm²","correct":"C","feedback_correct":"Boa! Você calculou certinho a área. 🚀","feedback_wrong":"Quase! Lembra: base × altura ÷ 2. Tenta a próxima! 😅"},
    {"mode":"IFES","id":"IFES-002","year":2022,"subject":"Português","difficulty":"médio","stem":"Assinale a alternativa em que o sujeito é composto.","option_a":"Chegou cedo a turma.","option_b":"Os alunos e o professor saíram.","option_c":"Vive-se melhor aqui.","option_d":"Precisa-se de ajuda.","correct":"B","feedback_correct":"Show! Reconheceu o sujeito composto. 👏","feedback_wrong":"Foi por pouco! Busca o núcleo do sujeito. 😉"},
    {"mode":"IFES","id":"IFES-003","year":2021,"subject":"Biologia","difficulty":"fácil","stem":"A organela responsável pela fotossíntese é o:","option_a":"Cloroplasto","option_b":"Mitocôndria","option_c":"Complexo golgiense","option_d":"Ribossomo","correct":"A","feedback_correct":"Mandou bem! As clorofilas moram no cloroplasto. 🌿","feedback_wrong":"Olha a luz! Fotossíntese lembra cloro-PLASTO. 💡"},
    {"mode":"IFES","id":"IFES-004","year":2020,"subject":"Química","difficulty":"médio","stem":"O principal gás do efeito estufa liberado pela queima de combustíveis fósseis é:","option_a":"O2","option_b":"CO2","option_c":"N2","option_d":"H2","correct":"B","feedback_correct":"Aquecendo os acertos! 🔥","feedback_wrong":"Errou, mas sem efeito estufa em você! Bora pra próxima. 😄"},
    {"mode":"IFES","id":"IFES-005","year":2024,"subject":"Física","difficulty":"fácil","stem":"A unidade de força no SI é:","option_a":"Watt (W)","option_b":"Newton (N)","option_c":"Pascal (Pa)","option_d":"Joule (J)","correct":"B","feedback_correct":"Perfeito! Força é Newton. 💪","feedback_wrong":"Ops! Força lembra N de Newton. ⚙️"},
    {"mode":"IFES","id":"IFES-006","year":2023,"subject":"Geografia","difficulty":"médio","stem":"O Egito localiza-se no continente:","option_a":"Europa","option_b":"Ásia","option_c":"África","option_d":"Oceania","correct":"C","feedback_correct":"Exato! África na veia. 🌍","feedback_wrong":"Quase… Pensa no rio Nilo, África! 🌊"},
    {"mode":"IFES","id":"IFES-007","year":2022,"subject":"História","difficulty":"fácil","stem":"A Proclamação da República no Brasil ocorreu em:","option_a":"1822","option_b":"1889","option_c":"1930","option_d":"1964","correct":"B","feedback_correct":"Rumo ao topo! 1889, certíssimo. 🏆","feedback_wrong":"Passou raspando! República é 1889. 🇧🇷"},
    {"mode":"IFES","id":"IFES-008","year":2021,"subject":"Literatura","difficulty":"médio","stem":"O autor de 'Vidas Secas' é:","option_a":"Graciliano Ramos","option_b":"Machado de Assis","option_c":"José de Alencar","option_d":"Carlos Drummond de Andrade","correct":"A","feedback_correct":"Boa! Clássico do regionalismo. 📚","feedback_wrong":"Foi quase… ‘Vidas Secas’ é do Graciliano. 😉"},
    {"mode":"IFES","id":"IFES-009","year":2020,"subject":"Matemática","difficulty":"médio","stem":"A soma dos ângulos internos de um triângulo é igual a:","option_a":"90°","option_b":"180°","option_c":"270°","option_d":"360°","correct":"B","feedback_correct":"Ótimo! Triângulo sempre 180°. 🔺","feedback_wrong":"Ops, triângulo fecha 180°. Bora! 💡"},
    {"mode":"IFES","id":"IFES-010","year":2024,"subject":"Português","difficulty":"fácil","stem":"A forma correta é:","option_a":"Houveram problemas no teste.","option_b":"Existiram problemas no teste.","option_c":"Houve problemas no teste.","option_d":"Teve problemas no teste.","correct":"C","feedback_correct":"Mandou bem! Verbo impessoal: 'Houve'. ✅","feedback_wrong":"Pegadinha! Com 'haver' impessoal, fica 'Houve'. 😉"}
  ],
  ENEM: [
    {"mode":"ENEM","id":"ENEM-001","year":2024,"subject":"Matemática","difficulty":"médio","stem":"Um produto custava R$ 200 e teve 25% de desconto. O preço final é:","option_a":"R$ 150,00","option_b":"R$ 155,00","option_c":"R$ 160,00","option_d":"R$ 170,00","correct":"A","feedback_correct":"Desconto aplicado com sucesso! 🧮","feedback_wrong":"Reveja a conta do desconto e tenta de novo! 😉"},
    {"mode":"ENEM","id":"ENEM-002","year":2023,"subject":"Química","difficulty":"médio","stem":"O pH de uma solução ácida típica é:","option_a":"menor que 7","option_b":"igual a 7","option_c":"maior que 7","option_d":"igual a 14","correct":"A","feedback_correct":"Ácido que é ácido fica < 7. 🧪","feedback_wrong":"Não desanima! pH ácido < 7. 👍"},
    {"mode":"ENEM","id":"ENEM-003","year":2022,"subject":"Biologia","difficulty":"médio","stem":"O DNA encontra-se principalmente no:","option_a":"Citoplasma","option_b":"Núcleo","option_c":"Complexo golgiense","option_d":"Lisossomo","correct":"B","feedback_correct":"Certo! Núcleo é o QG do DNA. 🧬","feedback_wrong":"Pense no núcleo como o cofre do DNA. 🔐"},
    {"mode":"ENEM","id":"ENEM-004","year":2021,"subject":"Geografia","difficulty":"fácil","stem":"A linha do Equador divide a Terra em:","option_a":"Hemisférios Leste e Oeste","option_b":"Trópicos","option_c":"Hemisférios Norte e Sul","option_d":"Meridianos","correct":"C","feedback_correct":"Acertou em cheio! Norte e Sul. 🌎","feedback_wrong":"Quase! Equador separa Norte/Sul. 📍"},
    {"mode":"ENEM","id":"ENEM-005","year":2020,"subject":"História","difficulty":"médio","stem":"O Período Regencial (1831–1840) no Brasil foi marcado por:","option_a":"Centralização extrema","option_b":"Revoltas provinciais","option_c":"Dom Pedro II governando","option_d":"República Velha","correct":"B","feedback_correct":"Mandou bem! Muitas revoltas no período. 🛡️","feedback_wrong":"Boa tentativa! Esse período teve muitas revoltas. ⚔️"},
    {"mode":"ENEM","id":"ENEM-006","year":2023,"subject":"Física","difficulty":"médio","stem":"A energia cinética de um corpo depende de:","option_a":"apenas da massa","option_b":"apenas da velocidade","option_c":"da massa e do quadrado da velocidade","option_d":"apenas da altura","correct":"C","feedback_correct":"Perfeito: Ec = ½·m·v². ⚡","feedback_wrong":"Não foi dessa! Guarda a fórmula Ec = ½·m·v². 📐"},
    {"mode":"ENEM","id":"ENEM-007","year":2022,"subject":"Matemática","difficulty":"fácil","stem":"A fração 3/4 em porcentagem é:","option_a":"50%","option_b":"60%","option_c":"70%","option_d":"75%","correct":"D","feedback_correct":"Top! 3/4 = 0,75 = 75%. ✅","feedback_wrong":"Quase… 3 dividido por 4 é 0,75 = 75%. 🔢"},
    {"mode":"ENEM","id":"ENEM-008","year":2021,"subject":"Português","difficulty":"médio","stem":"Em 'fizemos a prova', o sujeito é:","option_a":"simples","option_b":"composto","option_c":"oculto","option_d":"indeterminado","correct":"A","feedback_correct":"Boa! Núcleo único: nós. ✍️","feedback_wrong":"Erra nada! O sujeito é simples. 😉"},
    {"mode":"ENEM","id":"ENEM-009","year":2024,"subject":"Artes","difficulty":"fácil","stem":"O movimento artístico cubista está associado principalmente a:","option_a":"Pablo Picasso e Georges Braque","option_b":"Claude Monet e Van Gogh","option_c":"Michelangelo e Rafael","option_d":"Tarsila e Portinari","correct":"A","feedback_correct":"Acertou! Cubismo é Picasso e Braque. 🎨","feedback_wrong":"Quase! Cubismo lembra Picasso. 🖼️"},
    {"mode":"ENEM","id":"ENEM-010","year":2020,"subject":"Sociologia","difficulty":"médio","stem":"Para Émile Durkheim, fato social é:","option_a":"Fenômeno individual e subjetivo","option_b":"Coerção exercida pela sociedade sobre os indivíduos","option_c":"Apenas leis jurídicas","option_d":"Algo biológico","correct":"B","feedback_correct":"Excelente! Durkheim = coerção social. 🧠","feedback_wrong":"Boa! Fato social tem caráter coercitivo. 📚"}
  ]
};

const LETTER_TO_INDEX = { A: 0, B: 1, C: 2, D: 3 };

// ------------------------
// Utilidades de importação
// ------------------------
function parseCSV(csvText) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < csvText.length) {
    const c = csvText[i];
    if (inQuotes) {
      if (c === '"' && csvText[i+1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { inQuotes = false; i++; continue; }
      field += c; i++; continue;
    } else {
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field.trim()); field=''; i++; continue; }
      if (c === '\\n' || c === '\\r') {
        if (field !== '' || row.length) { row.push(field.trim()); rows.push(row); }
        field=''; row=[]; i++;
        if (c==='\\r' && csvText[i]==='\\n') i++;
        continue;
      }
      field += c; i++;
    }
  }
  if (field !== '' || row.length) { row.push(field.trim()); rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim());
  return rows.slice(1).filter(r => r.some(x => x && x.length)).map(r => Object.fromEntries(header.map((h, idx) => [h, (r[idx] ?? '').trim()])));
}

function normalizeRecords(records) {
  const byMode = { IFES: [], ENEM: [] };
  for (const rec of records) {
    const mode = (rec.mode || rec.modo || '').toString().toUpperCase();
    const obj = {
      mode: mode || 'IFES',
      id: rec.id || '',
      year: Number(rec.year || rec.ano || 0) || undefined,
      subject: rec.subject || rec.materia || rec.disciplina || '',
      difficulty: rec.difficulty || rec.dificuldade || '',
      stem: rec.stem || rec.pergunta || '',
      option_a: rec.option_a || rec.A || rec.a || '',
      option_b: rec.option_b || rec.B || rec.b || '',
      option_c: rec.option_c || rec.C || rec.c || '',
      option_d: rec.option_d || rec.D || rec.d || '',
      correct: (rec.correct || rec.gabarito || '').toString().trim().toUpperCase(),
      feedback_correct: rec.feedback_correct || rec.ok || '',
      feedback_wrong: rec.feedback_wrong || rec.err || '',
    };
    const bucket = mode === 'ENEM' ? 'ENEM' : 'IFES';
    byMode[bucket].push(obj);
  }
  return byMode;
}

export default function App() {
  const sfx = useSFX();

  const [mode, setMode] = useState(null); // "IFES" | "ENEM"
  const [avatar, setAvatar] = useState(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // {type:'right'|'wrong', text}
  const [phaseMedal, setPhaseMedal] = useState(null); // {phase,total}

  // Ranking & tempo
  const [leaderboard, setLeaderboard] = useState([]);
  const [showRanking, setShowRanking] = useState(false);
  const [askName, setAskName] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const startTime = useRef(null);

  // Importação
  const [customData, setCustomData] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dds_leaderboard");
      if (raw) setLeaderboard(JSON.parse(raw));
    } catch {}
  }, []);

  function saveLeaderboard(newEntry) {
    const list = [...leaderboard, newEntry]
      .sort((a, b) => (b.score - a.score) || (a.timeMs - b.timeMs))
      .slice(0, 20);
    setLeaderboard(list);
    try { localStorage.setItem("dds_leaderboard", JSON.stringify(list)); } catch {}
  }

  const dataSource = customData ?? QUESTIONS;

  const questions = useMemo(() => {
    const pool = mode ? dataSource[mode] : [];
    return (pool || []).map((q) => ({
      id: q.id,
      stem: q.stem,
      options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
      correct: LETTER_TO_INDEX[q.correct] ?? 0,
      subject: q.subject,
      feedbackRight: q.feedback_correct,
      feedbackWrong: q.feedback_wrong,
    }));
  }, [mode, dataSource]);

  const current = questions[index];

  function resetGame() {
    setStarted(false);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setPhaseMedal(null);
    setAskName(false);
    setPlayerName("");
    startTime.current = null;
  }

  function chooseAnswer(optIdx) {
    if (!current) return;
    const isRight = optIdx === current.correct;
    if (isRight) {
      const msg = current.feedbackRight || MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];
      sfx.correct();
      setScore((s) => s + 1);
      setStreak((k) => k + 1);
      setFeedback({ type: "right", text: msg });
    } else {
      const msg = current.feedbackWrong || FUNNY_WRONG[Math.floor(Math.random() * FUNNY_WRONG.length)];
      sfx.wrong();
      setStreak(0);
      setFeedback({ type: "wrong", text: msg });
    }

    setTimeout(() => {
      const next = index + 1;
      const reachedPhase = (next) % 5 === 0;
      setIndex(next);
      setFeedback(null);
      if (reachedPhase) {
        setPhaseMedal({ phase: next / 5, total: next });
        sfx.medal();
      }
    }, 800);
  }

  const gameFinished = index >= questions.length;

  useEffect(() => {
    if (started && gameFinished) {
      setAskName(true);
    }
  }, [started, gameFinished]);

  async function importFromUrl() {
    if (!importUrl) return;
    try {
      const res = await fetch(importUrl);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        const records = parseCSV(text);
        data = normalizeRecords(records);
      }
      if (data.ALL && (data.IFES || data.ENEM)) {
        setCustomData({ IFES: data.IFES || data.ALL || [], ENEM: data.ENEM || data.ALL || [] });
      } else if (data.IFES || data.ENEM) {
        setCustomData({ IFES: data.IFES || [], ENEM: data.ENEM || [] });
      } else if (Array.isArray(data)) {
        setCustomData(normalizeRecords(data));
      } else {
        const records = parseCSV(text);
        setCustomData(normalizeRecords(records));
      }
      setShowImport(false);
    } catch (e) {
      alert("Falha ao importar da URL. Verifique se está publicada como CSV ou JSON.");
    }
  }

  function importFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        let data;
        try { data = JSON.parse(text); } catch { data = null; }
        if (data) {
          if (data.ALL && (data.IFES || data.ENEM)) {
            setCustomData({ IFES: data.IFES || data.ALL || [], ENEM: data.ENEM || data.ALL || [] });
          } else if (data.IFES || data.ENEM) {
            setCustomData({ IFES: data.IFES || [], ENEM: data.ENEM || [] });
          } else if (Array.isArray(data)) {
            setCustomData(normalizeRecords(data));
          } else {
            throw new Error('JSON inválido');
          }
        } else {
          const records = parseCSV(text);
          setCustomData(normalizeRecords(records));
        }
        setShowImport(false);
      } catch (e) {
        alert("Arquivo inválido. Use CSV/JSON no modelo indicado.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-500 via-indigo-600 to-fuchsia-600 p-4 text-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg">
            Desafio do Saber <span className="text-amber-300">IFES & ENEM</span>
          </h1>
          <div className="flex gap-2 items-center">
            <button onClick={() => setShowImport(true)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm">Importar perguntas</button>
            {mode && <Chip>{mode}</Chip>}
            {avatar && <Chip>{avatar.name}</Chip>}
            <Chip>Score: {score}</Chip>
          </div>
        </div>

        {/* HOME / MODO */}
        {!mode && (
          <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "IFES", desc: "Questões recentes do IFES" },
              { id: "ENEM", desc: "Questões oficiais do ENEM" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className="rounded-2xl p-6 bg-white/10 hover:bg-white/20 transition shadow-xl backdrop-blur border border-white/20 text-left"
              >
                <h3 className="text-xl font-bold">{m.id}</h3>
                <p className="opacity-80">{m.desc}</p>
              </button>
            ))}
          </section>
        )}

        {/* AVATARES */}
        {mode && !avatar && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-3">Escolha seu personagem</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(a)}
                  className="rounded-2xl p-6 bg-white/10 hover:bg-white/20 transition shadow-xl backdrop-blur border border-white/20 text-left"
                >
                  <div className="text-4xl mb-2">{a.emoji}</div>
                  <div className="text-lg font-semibold">{a.name}</div>
                  <div className="text-sm opacity-80">{a.tagline}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* BOTÃO INICIAR */}
        {mode && avatar && !started && (
          <div className="mt-10 flex items-center gap-3">
            <button
              onClick={() => { setStarted(true); startTime.current = Date.now(); }}
              className="px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold shadow-lg"
            >
              Iniciar Fase 1
            </button>
            <button onClick={resetGame} className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20">
              Trocar modo/Avatar
            </button>
          </div>
        )}

        {/* GAMEPLAY */}
        {started && !gameFinished && current && (
          <section className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm opacity-90">Pergunta {index + 1} de {questions.length}</div>
              <div className="text-sm opacity-90">Matéria: {current.subject}</div>
            </div>

            <div className="text-lg md:text-xl font-semibold mb-4 drop-shadow">
              {current.stem}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => chooseAnswer(i)}
                  className="text-left px-4 py-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 border border-white/10"
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className={`mt-4 p-3 rounded-xl text-sm font-semibold ${
                    feedback.type === "right" ? "bg-emerald-400 text-slate-900" : "bg-rose-400 text-slate-900"
                  }`}
                >
                  {feedback.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
              <Chip>Streak: {streak}</Chip>
              <Chip>Fase: {Math.floor(index / 5) + 1}</Chip>
            </div>
          </section>
        )}

        {/* FIM */}
        {started && gameFinished && (
          <section className="mt-10 text-center">
            <div className="text-4xl">🏆</div>
            <h2 className="text-2xl font-extrabold mt-2">Você concluiu o protótipo!</h2>
            <p className="opacity-90 mt-1">Pontuação final: {score}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => setShowRanking(true)} className="px-6 py-3 rounded-2xl bg-amber-400 text-slate-900 font-bold">Ver Ranking</button>
              <button onClick={resetGame} className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20">Voltar ao início</button>
            </div>
          </section>
        )}
      </div>

      {/* OVERLAY DE MEDALHA A CADA 5 PERGUNTAS */}
      <AnimatePresence>
        {phaseMedal && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPhaseMedal(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center text-slate-900 shadow-2xl"
            >
              <div className="text-3xl mb-3">Parabéns!</div>
              <div className="flex items-center justify-center mb-4">
                <Medal index={(phaseMedal.phase - 1) % 4} />
              </div>
              <p className="font-semibold">Fase {phaseMedal.phase} concluída!</p>
              <p className="text-slate-600 text-sm">Total de perguntas respondidas: {phaseMedal.total}</p>
              <button
                onClick={() => setPhaseMedal(null)}
                className="mt-5 w-full px-4 py-3 rounded-2xl bg-emerald-500 text-white font-bold"
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: SALVAR NO RANKING */}
      <AnimatePresence>
        {askName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-slate-900"
            >
              <h3 className="text-xl font-bold mb-2">Salvar no ranking</h3>
              <p className="text-sm text-slate-600 mb-4">Digite um apelido para registrar sua pontuação.</p>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Seu apelido"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const timeMs = startTime.current ? Date.now() - startTime.current : 0;
                    const entry = { name: playerName || "Anônimo", score, timeMs, date: new Date().toISOString() };
                    saveLeaderboard(entry);
                    setAskName(false);
                    setShowRanking(true);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold"
                >Salvar</button>
                <button onClick={() => setAskName(false)} className="px-4 py-3 rounded-xl bg-white border">Pular</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: RANKING */}
      <AnimatePresence>
        {showRanking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md text-slate-900"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Ranking</h3>
                <button onClick={() => setShowRanking(false)} className="text-sm px-3 py-1 rounded-full bg-slate-100">Fechar</button>
              </div>
              <ol className="space-y-2">
                {leaderboard.length === 0 && <div className="text-slate-600">Sem registros ainda.</div>}
                {leaderboard.map((r, i) => (
                  <li key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-200 text-slate-900 flex items-center justify-center text-xs font-bold">{i+1}</span>
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-slate-500">{new Date(r.date).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{r.score} pts</div>
                      <div className="text-xs text-slate-500">{Math.round(r.timeMs/1000)}s</div>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: IMPORTAR PERGUNTAS */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-xl text-slate-900"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Importar perguntas</h3>
                <button onClick={() => setShowImport(false)} className="text-sm px-3 py-1 rounded-full bg-slate-100">Fechar</button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-1">1) Arquivo CSV/JSON</div>
                  <input ref={fileRef} type="file" accept=".csv,.json" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importFromFile(f);
                  }} className="block w-full text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Campos esperados no CSV: mode,id,year,subject,difficulty,stem,option_a,option_b,option_c,option_d,correct,feedback_correct,feedback_wrong</p>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-1">2) URL (CSV publicado / JSON)</div>
                  <input
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://docs.google.com/.../pub?output=csv"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none"
                  />
                  <div className="mt-2 flex gap-2">
                    <button onClick={importFromUrl} className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold">Importar da URL</button>
                    <button onClick={() => setCustomData(null)} className="px-4 py-2 rounded-xl bg-slate-100">Voltar para perguntas padrão</button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Dica (Google Sheets): Arquivo → Publicar na Web → formato CSV → cole o link aqui.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
