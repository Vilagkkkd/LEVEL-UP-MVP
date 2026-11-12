"use client";

import { useEffect, useMemo, useState } from "react";

type Mission = { id: string; title: string; category: string; xp: number; done: boolean; detail: string };
const initialMissions: Mission[] = [
  { id: "water", title: "Выпить стакан воды после пробуждения", category: "Физика", xp: 10, done: false, detail: "Маленький старт дня без давления." },
  { id: "focus", title: "25 минут сфокусированной работы", category: "Дисциплина", xp: 25, done: false, detail: "Убери отвлекающие факторы и выбери одну задачу." },
  { id: "learn", title: "Изучить что-то новое 15 минут", category: "Интеллект", xp: 15, done: false, detail: "Книга, урок или практика навыка." },
  { id: "walk", title: "Прогуляться 20 минут", category: "Физика", xp: 20, done: false, detail: "Подойдёт спокойная прогулка в удобном темпе." },
];

declare global {
  interface Window {
    Telegram?: { WebApp?: { ready: () => void; expand: () => void; initData?: string; initDataUnsafe?: { user?: { first_name?: string; username?: string } }; HapticFeedback?: { impactOccurred: (style: string) => void } } };
  }
}

export default function Home() {
  const [name, setName] = useState("Игрок");
  const [missions, setMissions] = useState(initialMissions);
  const [tab, setTab] = useState<"home" | "stats" | "profile">("home");
  const [goal, setGoal] = useState("Стать более дисциплинированным");
  const [showGoal, setShowGoal] = useState(false);
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
    const firstName = tg?.initDataUnsafe?.user?.first_name;
    if (firstName) setName(firstName);
    try {
      const saved = localStorage.getItem("levelup-state-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.missions)) setMissions(parsed.missions);
        if (typeof parsed.goal === "string") setGoal(parsed.goal);
        if (typeof parsed.streak === "number") setStreak(parsed.streak);
      }
    } catch { /* start with demo state */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("levelup-state-v1", JSON.stringify({ missions, goal, streak }));
  }, [missions, goal, streak]);

  const xp = missions.filter(m => m.done).reduce((sum, m) => sum + m.xp, 0);
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  const completed = missions.filter(m => m.done).length;
  const toggleMission = (id: string) => {
    setMissions(current => current.map(m => m.id === id ? { ...m, done: !m.done } : m));
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
  };
  const categories = useMemo(() => [
    { name: "Физика", score: 24, icon: "✦" },
    { name: "Интеллект", score: 18, icon: "⌘" },
    { name: "Дисциплина", score: 31, icon: "◈" },
    { name: "Ментальность", score: 20, icon: "◎" },
    { name: "Финансы", score: 12, icon: "₽" },
    { name: "Социализация", score: 16, icon: "↗" },
  ], []);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">L</span><span>LEVEL<span className="accent">UP</span></span></div>
        <div className="avatar">{name.slice(0,1).toUpperCase()}</div>
      </header>

      {tab === "home" && <>
        <section className="hero">
          <div className="eyebrow">ТВОЯ НОВАЯ ГЛАВА</div>
          <h1>Привет, {name}<br/><span className="muted">пора прокачаться.</span></h1>
          <p className="sub">Не пытайся изменить всё за день. Сделай следующий шаг.</p>
          <div className="level-card">
            <div className="level-row"><div><span className="eyebrow">ТВОЙ УРОВЕНЬ</span><div className="level-number">LVL {level}</div></div><div className="xp-total"><b>{xp} XP</b><span>всего заработано</span></div></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="progress-caption"><span>{progress}/100 XP до следующего уровня</span><span>⚡ {streak} день</span></div>
          </div>
        </section>

        <section className="section-head"><div><div className="eyebrow">ТВОЙ ФОКУС</div><h2>Главная цель</h2></div><button className="text-button" onClick={() => setShowGoal(true)}>Изменить</button></section>
        <div className="goal-card"><span className="goal-icon">◎</span><div><b>{goal}</b><small>Один приоритет. Последовательные действия.</small></div></div>

        <section className="section-head"><div><div className="eyebrow">МИССИИ НА СЕГОДНЯ</div><h2>Сделай ход</h2></div><span className="counter">{completed}/{missions.length}</span></section>
        <div className="mission-list">
          {missions.map(m => <button key={m.id} className={`mission ${m.done ? "mission-done" : ""}`} onClick={() => toggleMission(m.id)}>
            <span className="check">{m.done ? "✓" : "＋"}</span><span className="mission-copy"><b>{m.title}</b><small>{m.category} · {m.detail}</small></span><span className="xp-pill">+{m.xp}</span>
          </button>)}
        </div>
        <div className="quote">«Система побеждает мотивацию. Один шаг — уже прогресс.»</div>
      </>}

      {tab === "stats" && <>
        <section className="hero compact"><div className="eyebrow">ТВОЯ СТАТИСТИКА</div><h1>Прогресс<br/><span className="muted">в деталях.</span></h1><p className="sub">Развитие — это процесс, а не соревнование.</p></section>
        <div className="stats-grid"><div className="stat-card"><small>ЗАРАБОТАНО XP</small><strong>{xp}</strong></div><div className="stat-card"><small>ВЫПОЛНЕНО МИССИЙ</small><strong>{completed}</strong></div><div className="stat-card"><small>ТЕКУЩИЙ УРОВЕНЬ</small><strong>{level}</strong></div><div className="stat-card"><small>ТЕКУЩАЯ СЕРИЯ</small><strong>{streak} дн.</strong></div></div>
        <section className="section-head"><div><div className="eyebrow">ХАРАКТЕРИСТИКИ</div><h2>Твои направления</h2></div></section>
        <div className="attribute-list">{categories.map(c => <div className="attribute" key={c.name}><span className="attribute-icon">{c.icon}</span><span>{c.name}</span><div className="mini-track"><i style={{ width: `${c.score}%` }}/></div><b>{c.score}</b></div>)}</div>
        <p className="notice">Показатели характеристик в демо-версии — иллюстративные. В полной версии они будут рассчитываться по подтверждённым действиям и регулярности.</p>
      </>}

      {tab === "profile" && <>
        <section className="hero compact"><div className="eyebrow">ПЕРСОНАЖ</div><h1>{name}<br/><span className="muted">это твой путь.</span></h1></section>
        <div className="profile-card"><div className="big-avatar">{name.slice(0,1).toUpperCase()}</div><div><b>{name}</b><small>Уровень {level} · Исследователь</small></div></div>
        <section className="section-head"><div><div className="eyebrow">НАСТРОЙКИ</div><h2>Твоя система</h2></div></section>
        <button className="setting-row" onClick={() => setShowGoal(true)}><span>◎</span><b>Главная цель</b><span>›</span></button>
        <div className="setting-row"><span>◷</span><b>Ежедневные миссии</b><span>{missions.length}</span></div>
        <div className="setting-row"><span>✧</span><b>Версия приложения</b><span>0.1.0</span></div>
        <p className="notice">Это ранний MVP. Данные демо-режима хранятся на устройстве. Не используй его для хранения чувствительной информации.</p>
      </>}

      <nav className="bottom-nav">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><span>⌂</span>Главная</button>
        <button className={tab === "stats" ? "active" : ""} onClick={() => setTab("stats")}><span>▥</span>Прогресс</button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}><span>◉</span>Профиль</button>
      </nav>

      {showGoal && <div className="modal-backdrop" onClick={() => setShowGoal(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="eyebrow">ТВОЙ ВЕКТОР</div><h2>К чему стремишься?</h2><textarea value={goal} onChange={e => setGoal(e.target.value)} maxLength={90}/><button className="primary-button" onClick={() => setShowGoal(false)}>Сохранить цель</button></div></div>}
    </main>
  );
}
