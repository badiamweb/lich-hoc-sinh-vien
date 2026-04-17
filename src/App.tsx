import { useState, useEffect } from "react";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 -> 18

const COLORS = [
  { bg: "#1565C0", light: "#E3F2FD", border: "#1976D2" },
  { bg: "#00695C", light: "#E0F2F1", border: "#00796B" },
  { bg: "#6A1B9A", light: "#F3E5F5", border: "#7B1FA2" },
  { bg: "#E65100", light: "#FFF3E0", border: "#F57C00" },
  { bg: "#AD1457", light: "#FCE4EC", border: "#C2185B" },
  { bg: "#1B5E20", light: "#E8F5E9", border: "#2E7D32" },
];

const INITIAL_SUBJECTS = [
  { id: 1, name: "Lập Trình Web", teacher: "TS. Nguyễn Văn A", colorIdx: 0 },
  { id: 2, name: "Cơ Sở Dữ Liệu", teacher: "ThS. Trần Thị B", colorIdx: 1 },
  { id: 3, name: "Mạng Máy Tính", teacher: "PGS. Lê Văn C", colorIdx: 2 },
  { id: 4, name: "Trí Tuệ Nhân Tạo", teacher: "TS. Phạm Thị D", colorIdx: 3 },
  { id: 5, name: "Kiến Trúc Máy Tính", teacher: "ThS. Hoàng Văn E", colorIdx: 4 },
];

const INITIAL_ROOMS = [
  { id: 1, name: "C1-101" }, { id: 2, name: "C2-203" },
  { id: 3, name: "B3-301" }, { id: 4, name: "A1-405" },
  { id: 5, name: "D2-102" },
];

const INITIAL_SCHEDULE = [
  { id: 1, subjectId: 1, roomId: 1, day: 1, startTime: 7, endTime: 9 },
  { id: 2, subjectId: 2, roomId: 2, day: 1, startTime: 10, endTime: 12 },
  { id: 3, subjectId: 3, roomId: 3, day: 2, startTime: 7, endTime: 9 },
  { id: 4, subjectId: 4, roomId: 4, day: 3, startTime: 13, endTime: 15 },
  { id: 5, subjectId: 5, roomId: 5, day: 4, startTime: 8, endTime: 10 },
  { id: 6, subjectId: 1, roomId: 2, day: 5, startTime: 15, endTime: 17 },
  { id: 7, subjectId: 2, roomId: 3, day: 6, startTime: 7, endTime: 9 },
  { id: 8, subjectId: 3, roomId: 1, day: 2, startTime: 13, endTime: 16 },
];

const CELL_HEIGHT = 64;

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

export default function App() {
  const [subjects, setSubjects] = useLocalStorage("tkb_subjects", INITIAL_SUBJECTS);
  const [rooms, setRooms] = useLocalStorage("tkb_rooms", INITIAL_ROOMS);
  const [schedule, setSchedule] = useLocalStorage("tkb_schedule", INITIAL_SCHEDULE);
  const [role, setRole] = useLocalStorage("tkb_role", "student");
  const [view, setView] = useState("timetable");
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "", error: "" });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [nextId, setNextId] = useLocalStorage("tkb_nextid", 100);

  const getSubject = (id) => subjects.find(s => s.id === id);
  const getRoom = (id) => rooms.find(r => r.id === id);

  function handleLogin(e) {
    e.preventDefault();
    if (loginForm.username === "admin" && loginForm.password === "admin123") {
      setRole("admin"); setShowLogin(false); setLoginForm({ username: "", password: "", error: "" });
    } else if (loginForm.username === "sv" && loginForm.password === "sv123") {
      setRole("student"); setShowLogin(false); setLoginForm({ username: "", password: "", error: "" });
    } else {
      setLoginForm(f => ({ ...f, error: "Sai tài khoản hoặc mật khẩu!" }));
    }
  }

  function addScheduleEntry(form) {
    const sub = parseInt(form.subjectId), day = parseInt(form.day);
    const start = parseInt(form.startTime), end = parseInt(form.endTime);
    const conflict = schedule.find(s =>
      s.day === day && s.id !== (editEntry?.id) &&
      ((start >= s.startTime && start < s.endTime) || (end > s.startTime && end <= s.endTime) || (start <= s.startTime && end >= s.endTime))
    );
    if (conflict) return "Trùng lịch! Vui lòng chọn thời gian khác.";
    if (end <= start) return "Giờ kết thúc phải sau giờ bắt đầu!";
    if (editEntry) {
      setSchedule(prev => prev.map(s => s.id === editEntry.id ? { ...s, subjectId: sub, roomId: parseInt(form.roomId), day, startTime: start, endTime: end } : s));
    } else {
      const id = nextId; setNextId(id + 1);
      setSchedule(prev => [...prev, { id, subjectId: sub, roomId: parseInt(form.roomId), day, startTime: start, endTime: end }]);
    }
    return null;
  }

  function deleteEntry(id) {
    setSchedule(prev => prev.filter(s => s.id !== id));
    setSelectedEntry(null);
  }

  const headerStyle = {
    background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)",
    color: "white", padding: "0 24px", display: "flex", alignItems: "center",
    justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", minHeight: 64, flexWrap: "wrap", gap: 8
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>CỔNG THÔNG TIN SINH VIÊN</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Hệ thống Thời Khóa Biểu</div>
          </div>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {[["timetable", "📅 Thời Khóa Biểu"], ...(role === "admin" ? [["subjects", "📚 Môn Học"], ["rooms", "🏫 Phòng Học"]] : [])].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "rgba(255,255,255,0.25)" : "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: view === v ? 600 : 400 }}>{label}</button>
          ))}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.3)", margin: "0 4px" }} />
          {role === "admin"
            ? <button onClick={() => { setRole("student"); }} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", color: "white", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>👤 Đăng xuất</button>
            : <button onClick={() => setShowLogin(true)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", color: "white", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>🔐 Admin</button>
          }
          <div style={{ background: role === "admin" ? "#FFD600" : "rgba(255,255,255,0.2)", color: role === "admin" ? "#1A237E" : "white", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {role === "admin" ? "ADMIN" : "Sinh Viên"}
          </div>
        </nav>
      </header>

      <main style={{ padding: "20px 16px", maxWidth: 1400, margin: "0 auto" }}>
        {view === "timetable" && <TimetableView schedule={schedule} subjects={subjects} rooms={rooms} getSubject={getSubject} getRoom={getRoom} role={role} onSelect={setSelectedEntry} onAdd={() => setShowAddSchedule(true)} />}
        {view === "subjects" && role === "admin" && <SubjectsView subjects={subjects} setSubjects={setSubjects} nextId={nextId} setNextId={setNextId} showAdd={showAddSubject} setShowAdd={setShowAddSubject} />}
        {view === "rooms" && role === "admin" && <RoomsView rooms={rooms} setRooms={setRooms} nextId={nextId} setNextId={setNextId} showAdd={showAddRoom} setShowAdd={setShowAddRoom} />}
      </main>

      {/* Modals */}
      {showLogin && <LoginModal form={loginForm} setForm={setLoginForm} onLogin={handleLogin} onClose={() => { setShowLogin(false); setLoginForm({ username: "", password: "", error: "" }); }} />}
      {selectedEntry && <EntryModal entry={selectedEntry} getSubject={getSubject} getRoom={getRoom} role={role} onClose={() => setSelectedEntry(null)} onDelete={deleteEntry} onEdit={(e) => { setEditEntry(e); setSelectedEntry(null); setShowAddSchedule(true); }} />}
      {showAddSchedule && <AddScheduleModal subjects={subjects} rooms={rooms} editEntry={editEntry} onSave={(form) => { const err = addScheduleEntry(form); if (!err) { setShowAddSchedule(false); setEditEntry(null); } return err; }} onClose={() => { setShowAddSchedule(false); setEditEntry(null); }} />}
    </div>
  );
}

function TimetableView({ schedule, subjects, rooms, getSubject, getRoom, role, onSelect, onAdd }) {
  const today = new Date().getDay(); // 0=Sun,1=Mon...6=Sat
  const todayColIdx = today >= 1 && today <= 6 ? today - 1 : -1;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1A237E" }}>📅 Thời Khóa Biểu</h2>
          <p style={{ margin: "2px 0 0", color: "#666", fontSize: 13 }}>Học kỳ 2 - Năm học 2024-2025</p>
        </div>
        {role === "admin" && <button onClick={onAdd} style={{ background: "#1565C0", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ Thêm Lịch Học</button>}
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", background: "white" }}>
        <div style={{ minWidth: 700 }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "72px repeat(6, 1fr)", background: "#0D47A1" }}>
            <div style={{ padding: "12px 8px", color: "rgba(255,255,255,0.7)", fontSize: 12, textAlign: "center", fontWeight: 600 }}>GIỜ</div>
            {DAYS.map((d, i) => (
              <div key={i} style={{ padding: "12px 4px", color: "white", fontSize: 13, textAlign: "center", fontWeight: 700, background: i === todayColIdx ? "rgba(255,255,255,0.2)" : "transparent", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
                {d}{i === todayColIdx && <div style={{ fontSize: 10, opacity: 0.8 }}>Hôm nay</div>}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div style={{ position: "relative" }}>
            {/* Hour rows */}
            {HOURS.map((hour, hi) => (
              <div key={hour} style={{ display: "grid", gridTemplateColumns: "72px repeat(6, 1fr)", borderBottom: "1px solid #E8EAF6", minHeight: CELL_HEIGHT }}>
                <div style={{ padding: "8px 4px", fontSize: 12, color: "#5C6BC0", textAlign: "center", fontWeight: 600, borderRight: "1px solid #E8EAF6", background: "#F8F9FE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
                  <span>{hour}:00</span>
                </div>
                {DAYS.map((_, di) => (
                  <div key={di} style={{ borderLeft: "1px solid #E8EAF6", background: di === todayColIdx ? "#F3F4FF" : "transparent", minHeight: CELL_HEIGHT }} />
                ))}
              </div>
            ))}

            {/* Schedule blocks - absolutely positioned */}
            {schedule.map(entry => {
              const sub = subjects.find(s => s.id === entry.subjectId);
              const room = rooms.find(r => r.id === entry.roomId);
              if (!sub) return null;
              const colW = `calc((100% - 72px) / 6)`;
              const top = (entry.startTime - 7) * CELL_HEIGHT;
              const height = (entry.endTime - entry.startTime) * CELL_HEIGHT - 4;
              const color = COLORS[sub.colorIdx % COLORS.length];
              const left = `calc(72px + ${entry.day - 1} * ${colW})`;

              return (
                <div key={entry.id} onClick={() => onSelect(entry)} style={{
                  position: "absolute", top, left, width: colW, height, padding: "6px 8px",
                  background: `linear-gradient(145deg, ${color.bg}, ${color.border})`,
                  borderRadius: 8, cursor: "pointer", boxSizing: "border-box",
                  borderLeft: `4px solid rgba(255,255,255,0.5)`,
                  overflow: "hidden", transition: "transform 0.1s, box-shadow 0.1s",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)"; }}
                >
                  <div style={{ color: "white", fontWeight: 700, fontSize: 12, lineHeight: 1.3, marginBottom: 2 }}>{sub.name}</div>
                  {height > 50 && <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>{sub.teacher}</div>}
                  {height > 70 && <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 }}>🏫 {room?.name || "?"}</div>}
                  {height > 90 && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 2 }}>⏰ {entry.startTime}:00 – {entry.endTime}:00</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {subjects.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[s.colorIdx % COLORS.length].bg }} />
            <span style={{ fontSize: 12, color: "#555" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectsView({ subjects, setSubjects, nextId, setNextId, showAdd, setShowAdd }) {
  const [form, setForm] = useState({ name: "", teacher: "", colorIdx: 0 });
  const [error, setError] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.teacher.trim()) { setError("Vui lòng điền đầy đủ!"); return; }
    const id = nextId; setNextId(id + 1);
    setSubjects(prev => [...prev, { id, name: form.name.trim(), teacher: form.teacher.trim(), colorIdx: parseInt(form.colorIdx) }]);
    setForm({ name: "", teacher: "", colorIdx: 0 }); setShowAdd(false); setError("");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1A237E" }}>📚 Quản Lý Môn Học</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#1565C0", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ Thêm Môn</button>
      </div>

      {showAdd && (
        <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: "0 0 16px", color: "#1A237E" }}>Thêm Môn Học Mới</h3>
          {error && <div style={{ color: "red", marginBottom: 12, fontSize: 13 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelSt}>Tên môn học *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputSt} placeholder="VD: Lập Trình Web" /></div>
            <div><label style={labelSt}>Giảng viên *</label><input value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))} style={inputSt} placeholder="VD: TS. Nguyễn Văn A" /></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelSt}>Màu sắc</label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {COLORS.map((c, i) => (
                <div key={i} onClick={() => setForm(f => ({ ...f, colorIdx: i }))} style={{ width: 28, height: 28, background: c.bg, borderRadius: 6, cursor: "pointer", border: form.colorIdx == i ? "3px solid #333" : "2px solid transparent" }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={handleAdd} style={btnPrimary}>Lưu</button>
            <button onClick={() => { setShowAdd(false); setError(""); }} style={btnSecondary}>Hủy</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {subjects.map(s => {
          const c = COLORS[s.colorIdx % COLORS.length];
          return (
            <div key={s.id} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: `4px solid ${c.bg}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#1A237E", fontSize: 15 }}>{s.name}</div>
                <div style={{ color: "#666", fontSize: 13, marginTop: 2 }}>{s.teacher}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 16, height: 16, background: c.bg, borderRadius: 4 }} />
                <button onClick={() => setSubjects(prev => prev.filter(x => x.id !== s.id))} style={{ background: "#FFEBEE", color: "#C62828", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Xóa</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoomsView({ rooms, setRooms, nextId, setNextId, showAdd, setShowAdd }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Vui lòng nhập tên phòng!"); return; }
    const id = nextId; setNextId(id + 1);
    setRooms(prev => [...prev, { id, name: name.trim() }]);
    setName(""); setShowAdd(false); setError("");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1A237E" }}>🏫 Quản Lý Phòng Học</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#1565C0", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ Thêm Phòng</button>
      </div>

      {showAdd && (
        <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: "0 0 16px", color: "#1A237E" }}>Thêm Phòng Học</h3>
          {error && <div style={{ color: "red", marginBottom: 12, fontSize: 13 }}>{error}</div>}
          <input value={name} onChange={e => setName(e.target.value)} style={{ ...inputSt, maxWidth: 300 }} placeholder="VD: C1-101" />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handleAdd} style={btnPrimary}>Lưu</button>
            <button onClick={() => { setShowAdd(false); setError(""); }} style={btnSecondary}>Hủy</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {rooms.map(r => (
          <div key={r.id} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🏫</div>
            <div style={{ fontWeight: 700, color: "#1A237E", fontSize: 15 }}>{r.name}</div>
            <button onClick={() => setRooms(prev => prev.filter(x => x.id !== r.id))} style={{ background: "#FFEBEE", color: "#C62828", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, marginTop: 10 }}>Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginModal({ form, setForm, onLogin, onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ margin: "0 0 20px", color: "#1A237E", fontSize: 20 }}>🔐 Đăng Nhập Admin</h2>
      {form.error && <div style={{ background: "#FFEBEE", color: "#C62828", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{form.error}</div>}
      <div style={{ background: "#E3F2FD", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: "#1565C0" }}>
        <strong>Admin:</strong> admin / admin123<br />
        <strong>Sinh viên:</strong> sv / sv123
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelSt}>Tài khoản</label>
        <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={inputSt} placeholder="username" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelSt}>Mật khẩu</label>
        <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && onLogin(e)} style={inputSt} placeholder="password" />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onLogin} style={btnPrimary}>Đăng Nhập</button>
        <button onClick={onClose} style={btnSecondary}>Hủy</button>
      </div>
    </ModalOverlay>
  );
}

function EntryModal({ entry, getSubject, getRoom, role, onClose, onDelete, onEdit }) {
  const sub = getSubject(entry.subjectId);
  const room = getRoom(entry.roomId);
  const color = COLORS[(sub?.colorIdx || 0) % COLORS.length];
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ background: `linear-gradient(135deg, ${color.bg}, ${color.border})`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>{sub?.name}</div>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 }}>{sub?.teacher}</div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {[["🏫 Phòng học", room?.name], ["📅 Ngày", DAYS[entry.day - 1]], ["⏰ Thời gian", `${entry.startTime}:00 – ${entry.endTime}:00`], ["⌛ Số tiết", `${entry.endTime - entry.startTime} tiết`]].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E8EAF6" }}>
            <span style={{ color: "#666", fontSize: 14 }}>{label}</span>
            <span style={{ fontWeight: 600, color: "#1A237E", fontSize: 14 }}>{val}</span>
          </div>
        ))}
      </div>
      {role === "admin" && (
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={() => onEdit(entry)} style={btnPrimary}>✏️ Sửa</button>
          <button onClick={() => onDelete(entry.id)} style={{ ...btnSecondary, color: "#C62828", borderColor: "#FFCDD2" }}>🗑️ Xóa</button>
          <button onClick={onClose} style={btnSecondary}>Đóng</button>
        </div>
      )}
      {role !== "admin" && <button onClick={onClose} style={{ ...btnPrimary, marginTop: 16 }}>Đóng</button>}
    </ModalOverlay>
  );
}

function AddScheduleModal({ subjects, rooms, editEntry, onSave, onClose }) {
  const [form, setForm] = useState({
    subjectId: editEntry?.subjectId || subjects[0]?.id || "",
    roomId: editEntry?.roomId || rooms[0]?.id || "",
    day: editEntry?.day || 1,
    startTime: editEntry?.startTime || 7,
    endTime: editEntry?.endTime || 9,
  });
  const [error, setError] = useState("");

  function handleSave() {
    const err = onSave(form);
    if (err) setError(err);
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 style={{ margin: "0 0 20px", color: "#1A237E", fontSize: 18 }}>{editEntry ? "✏️ Sửa Lịch Học" : "➕ Thêm Lịch Học"}</h2>
      {error && <div style={{ background: "#FFEBEE", color: "#C62828", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}
      <div style={{ display: "grid", gap: 14 }}>
        <div><label style={labelSt}>Môn học *</label>
          <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} style={inputSt}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div><label style={labelSt}>Phòng học *</label>
          <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))} style={inputSt}>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div><label style={labelSt}>Ngày trong tuần *</label>
          <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} style={inputSt}>
            {DAYS.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={labelSt}>Giờ bắt đầu</label>
            <select value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inputSt}>
              {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
          <div><label style={labelSt}>Giờ kết thúc</label>
            <select value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={inputSt}>
              {HOURS.filter(h => h > 7).map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button onClick={handleSave} style={btnPrimary}>💾 Lưu</button>
        <button onClick={onClose} style={btnSecondary}>Hủy</button>
      </div>
    </ModalOverlay>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {children}
      </div>
    </div>
  );
}

const labelSt = { display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 4 };
const inputSt = { width: "100%", padding: "9px 12px", border: "1px solid #C5CAE9", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", background: "white" };
const btnPrimary = { background: "#1565C0", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 };
const btnSecondary = { background: "white", color: "#444", border: "1px solid #C5CAE9", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14 };
