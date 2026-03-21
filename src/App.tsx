import { useState } from "react";
import "./App.css";

const logo =
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg";

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [newClass, setNewClass] = useState({
    name: "",
    teacher: "",
    day: "Thứ 2",
    time: "07:00",
  });

  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const times = ["07:00", "09:00", "13:00", "15:00"];

  // LOGIN
  if (!role) {
    return (
      <div className="login">
        <img src={logo} className="logo" />
        <h2>HỆ THỐNG LỊCH HỌC GIA ĐỊNH</h2>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Nhập Mã số sinh viên"
        />
        <button
          onClick={() =>
            id === "admin" ? setRole("admin") : setRole("student")
          }
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <header className="header">
        <div className="logoWrap">
          <img src={logo} className="logoSmall" />
          <div>
            <div className="title">ĐẠI HỌC GIA ĐỊNH</div>
            <div className="sub">CỔNG THÔNG TIN SINH VIÊN</div>
          </div>
        </div>

        <div className="menu">
          <span>Trang chủ</span>
          <span>Lịch học</span>
          <span>Thông báo</span>
        </div>

        <button onClick={() => setRole(null)} className="logout">
          Đăng xuất
        </button>
      </header>

      {/* CONTENT */}
      <div className="container">
        <h2>THỜI KHÓA BIỂU</h2>

        {/* ADMIN */}
        {role === "admin" && (
          <div className="form">
            <input
              placeholder="Tên môn"
              onChange={(e) =>
                setNewClass({ ...newClass, name: e.target.value })
              }
            />
            <input
              placeholder="Giảng viên"
              onChange={(e) =>
                setNewClass({ ...newClass, teacher: e.target.value })
              }
            />

            <select
              onChange={(e) =>
                setNewClass({ ...newClass, day: e.target.value })
              }
            >
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <select
              onChange={(e) =>
                setNewClass({ ...newClass, time: e.target.value })
              }
            >
              {times.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <button
              onClick={() => setClasses([...classes, newClass])}
            >
              Thêm lịch
            </button>
          </div>
        )}

        {/* TABLE */}
        <table>
          <thead>
            <tr>
              <th>Giờ</th>
              {days.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {times.map((t) => (
              <tr key={t}>
                <td>{t}</td>
                {days.map((d) => {
                  const c = classes.find(
                    (x) => x.day === d && x.time === t
                  );
                  return (
                    <td key={d}>
                      {c && (
                        <div className="classBox">
                          <b>{c.name}</b>
                          <span>{c.teacher}</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;