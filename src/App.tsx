
import "./App.css";

const startHour = 7;
const endHour = 18;

const subjects = [
  {
    name: "Tư tưởng Hồ Chí Minh",
    teacher: "Bùi Kim Ánh",
    room: "A101",
    day: 1,
    start: 9,
    end: 11,
  },
  {
    name: "Môi Trường",
    teacher: "Nguyễn Thị Xuân Thảo",
    room: "B203",
    day: 1,
    start: 13,
    end: 15,
  },
  {
    name: "Lập trình Hướng Đối Tượng",
    teacher: "Đinh Ngọc Diệp",
    room: "Lab 3",
    day: 1,
    start: 17,
    end: 18,
  },
  {
    name: "Triết học Mác Lênin",
    teacher: "Trần Minh Hiếu",
    room: "C105",
    day: 2,
    start: 17,
    end: 18,
  },
  {
    name: "Tiếng Anh 1",
    teacher: "Nguyễn Mai Phương",
    room: "D202",
    day: 3,
    start: 17,
    end: 18,
  },
];

function App() {
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  return (
    <div className="container">
      <h2>THỜI KHÓA BIỂU</h2>

      <div className="table">
        <div className="header">
          <div>Giờ</div>
          <div>Thứ 2</div>
          <div>Thứ 3</div>
          <div>Thứ 4</div>
          <div>Thứ 5</div>
          <div>Thứ 6</div>
          <div>Thứ 7</div>
        </div>

        {hours.map((hour) => (
          <div className="row" key={hour}>
            <div className="time">{hour}:00</div>

            {[1, 2, 3, 4, 5, 6].map((day) => {
              const subject = subjects.find(
                (s) => s.day === day && s.start === hour
              );

              return (
                <div className="cell" key={day}>
                  {subject && (
                    <div
                      className="class"
                      style={{
                        height: `${(subject.end - subject.start) * 60}px`,
                      }}
                    >
                      <b>{subject.name}</b>
                      <div>{subject.teacher}</div>
                      <div className="room">{subject.room}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
