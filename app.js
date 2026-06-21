// 간단한 데모용 사용자 ID
const CURRENT_USER_ID = "demo-user";

// 좌석 데이터 (room_id별로 12개 좌석 예시)
let seats = [];
for (let i = 1; i <= 12; i++) {
  seats.push({
    seat_id: `101-${i}`,
    room_id: "101",
    status: "available",
    position: i
  });
}
for (let i = 1; i <= 12; i++) {
  seats.push({
    seat_id: `102-${i}`,
    room_id: "102",
    status: "available",
    position: i
  });
}

// 예약 데이터 (localStorage에서 불러오기)
let reservations = loadReservations();

// 현재 선택된 좌석
let selectedSeatId = null;

// 섹션 전환
function showSection(sectionId) {
  document.getElementById("seat-section").style.display =
    sectionId === "seat-section" ? "block" : "none";
  document.getElementById("mypage-section").style.display =
    sectionId === "mypage-section" ? "block" : "none";

  if (sectionId === "mypage-section") {
    renderReservations();
  }
}

// 좌석 렌더링
function renderSeats() {
  const roomSelect = document.getElementById("room-select");
  const roomId = roomSelect.value;
  const seatMap = document.getElementById("seat-map");
  seatMap.innerHTML = "";
  selectedSeatId = null;
  document.getElementById("selected-seat-label").textContent = "없음";
  document.getElementById("reserve-btn").disabled = true;
  document.getElementById("message").textContent = "";

  const roomSeats = seats.filter((s) => s.room_id === roomId);

  roomSeats.forEach((seat) => {
    const btn = document.createElement("button");
    btn.classList.add("seat");
    btn.textContent = seat.seat_id;

    // 예약 상태 반영
    const reserved = reservations.some(
      (r) => r.seat_id === seat.seat_id && r.status === "active"
    );
    if (reserved) {
      seat.status = "reserved";
    } else {
      seat.status = "available";
    }

    if (seat.status === "available") {
      btn.classList.add("available");
      btn.onclick = () => selectSeat(seat.seat_id);
    } else if (seat.status === "reserved") {
      btn.classList.add("reserved");
      btn.disabled = true;
    }

    seatMap.appendChild(btn);
  });
}

// 좌석 선택
function selectSeat(seatId) {
  selectedSeatId = seatId;
  document.getElementById("selected-seat-label").textContent = seatId;
  document.getElementById("reserve-btn").disabled = false;

  // 선택 표시 업데이트
  const buttons = document.querySelectorAll(".seat");
  buttons.forEach((b) => b.classList.remove("selected"));
  const target = Array.from(buttons).find((b) => b.textContent === seatId);
  if (target) {
    target.classList.add("selected");
  }
}

// 좌석 예약
function reserveSeat() {
  if (!selectedSeatId) return;

  const timeSelect = document.getElementById("time-select");
  const timeRange = timeSelect.value;

  const newReservation = {
    reservation_id: `res-${Date.now()}`,
    user_id: CURRENT_USER_ID,
    seat_id: selectedSeatId,
    start_time: timeRange.split("-")[0],
    end_time: timeRange.split("-")[1],
    status: "active"
  };

  reservations.push(newReservation);
  saveReservations();

  document.getElementById("message").textContent =
    `좌석 ${selectedSeatId}가 ${timeRange}에 예약되었습니다.`;
  renderSeats();
}

// 예약 목록 렌더링 (마이페이지)
function renderReservations() {
  const container = document.getElementById("reservation-list");
  container.innerHTML = "";

  const myReservations = reservations.filter(
    (r) => r.user_id === CURRENT_USER_ID && r.status === "active"
  );

  if (myReservations.length === 0) {
    container.textContent = "현재 활성화된 예약이 없습니다.";
    return;
  }

  myReservations.forEach((r) => {
    const item = document.createElement("div");
    item.classList.add("reservation-item");
    item.innerHTML = `
      <span>좌석 ${r.seat_id} · ${r.start_time} ~ ${r.end_time}</span>
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "취소";
    cancelBtn.onclick = () => cancelReservation(r.reservation_id);

    item.appendChild(cancelBtn);
    container.appendChild(item);
  });
}

// 예약 취소
function cancelReservation(reservationId) {
  const target = reservations.find((r) => r.reservation_id === reservationId);
  if (!target) return;

  target.status = "cancelled";
  saveReservations();
  renderSeats();
  renderReservations();
}

// localStorage 저장/불러오기
function saveReservations() {
  localStorage.setItem("smartseat_reservations", JSON.stringify(reservations));
}

function loadReservations() {
  const raw = localStorage.getItem("smartseat_reservations");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// 초기 렌더링
window.onload = () => {
  renderSeats();
};
