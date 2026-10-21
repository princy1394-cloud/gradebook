const STORAGE_KEY = "gradebook.students.v1";
const avatarColors = [
  ["#eeeee8", "#5e6256"],
  ["#e9eee8", "#596b59"],
  ["#f1ece5", "#756451"],
  ["#eeecef", "#6a626f"],
  ["#e9edef", "#58666d"],
];

const elements = {
  addButton: document.querySelector("#add-student-button"),
  emptyAddButton: document.querySelector("#empty-add-button"),
  dialog: document.querySelector("#student-dialog"),
  form: document.querySelector("#student-form"),
  dialogTitle: document.querySelector("#dialog-title"),
  studentId: document.querySelector("#student-id"),
  studentName: document.querySelector("#student-name"),
  studentSubject: document.querySelector("#student-subject"),
  studentScore: document.querySelector("#student-score"),
  saveButton: document.querySelector("#save-student-button"),
  closeButton: document.querySelector("#close-dialog-button"),
  cancelButton: document.querySelector("#cancel-dialog-button"),
  searchInput: document.querySelector("#search-input"),
  rows: document.querySelector("#student-rows"),
  emptyState: document.querySelector("#empty-state"),
  emptyHeading: document.querySelector("#empty-heading"),
  emptyCopy: document.querySelector("#empty-copy"),
  studentCount: document.querySelector("#student-count"),
  classAverage: document.querySelector("#class-average"),
  topScore: document.querySelector("#top-score"),
  topScoreCaption: document.querySelector("#top-score-caption"),
  rosterCount: document.querySelector("#roster-count"),
  message: document.querySelector("#app-message"),
};

let students = loadStudents();

function isStudent(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.subject === "string"
    && Number.isFinite(value.score)
    && value.score >= 0
    && value.score <= 100;
}

function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isStudent)) {
      throw new Error("Saved gradebook data has an invalid format.");
    }
    return parsed;
  } catch (error) {
    showMessage(`Could not load saved data: ${error.message}`);
    return [];
  }
}

function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    showMessage("");
  } catch (error) {
    showMessage(`Could not save changes in this browser: ${error.message}`);
  }
}

function showMessage(message) {
  elements.message.textContent = message;
}

function gradeFor(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function initialsFor(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function createCell(className, text) {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  cell.textContent = text;
  return cell;
}

function createStudentRow(student, index) {
  const row = document.createElement("tr");
  const studentCell = document.createElement("td");
  const identity = document.createElement("div");
  const avatar = document.createElement("span");
  const name = document.createElement("span");
  const [background, foreground] = avatarColors[index % avatarColors.length];

  identity.className = "student-cell";
  avatar.className = "avatar";
  avatar.style.setProperty("--avatar-bg", background);
  avatar.style.setProperty("--avatar-color", foreground);
  avatar.textContent = initialsFor(student.name);
  avatar.setAttribute("aria-hidden", "true");
  name.textContent = student.name;
  identity.append(avatar, name);
  studentCell.append(identity);

  const scoreCell = document.createElement("td");
  scoreCell.className = "score-cell";
  scoreCell.append(document.createTextNode(`${student.score}% `));
  const scoreMax = document.createElement("span");
  scoreMax.textContent = "/ 100";
  scoreCell.append(scoreMax);

  const gradeCell = document.createElement("td");
  const grade = document.createElement("span");
  grade.className = `grade-pill${student.score < 60 ? " grade-low" : ""}`;
  grade.textContent = gradeFor(student.score);
  gradeCell.append(grade);

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "row-actions";
  actions.append(
    createActionButton("edit", student.id, "Edit student", "✎", "icon-button"),
    createActionButton("delete", student.id, "Delete student", "×", "icon-button delete-button"),
  );
  actionsCell.append(actions);

  row.append(studentCell, createCell("", student.subject), scoreCell, gradeCell, actionsCell);
  return row;
}

function createActionButton(action, id, label, icon, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.action = action;
  button.dataset.id = id;
  button.setAttribute("aria-label", label);
  button.textContent = icon;
  return button;
}

function render() {
  const query = elements.searchInput.value.trim().toLocaleLowerCase();
  const visibleStudents = students.filter((student) => (
    student.name.toLocaleLowerCase().includes(query)
    || student.subject.toLocaleLowerCase().includes(query)
  ));

  elements.rows.replaceChildren(...visibleStudents.map(createStudentRow));
  elements.emptyState.classList.toggle("is-visible", visibleStudents.length === 0);
  elements.emptyHeading.textContent = students.length === 0 ? "Your roster starts here" : "No matching students";
  elements.emptyCopy.textContent = students.length === 0
    ? "Add a student and their score to see your class progress."
    : "Try a different name or subject, or clear your search.";
  elements.emptyAddButton.hidden = students.length > 0;
  elements.studentCount.textContent = String(students.length);
  elements.rosterCount.textContent = `Showing ${visibleStudents.length} of ${students.length} student${students.length === 1 ? "" : "s"}`;

  if (students.length === 0) {
    elements.classAverage.textContent = "—";
    elements.topScore.textContent = "—";
    elements.topScoreCaption.textContent = "waiting for your first score";
    return;
  }

  const total = students.reduce((sum, student) => sum + student.score, 0);
  const topStudent = students.reduce((top, student) => (student.score > top.score ? student : top));
  elements.classAverage.textContent = `${(total / students.length).toFixed(1)}%`;
  elements.topScore.textContent = `${topStudent.score}%`;
  elements.topScoreCaption.textContent = topStudent.name;
}

function openDialog(student) {
  elements.form.reset();
  elements.studentId.value = student?.id ?? "";
  elements.dialogTitle.textContent = student ? "Edit student" : "Add a student";
  elements.saveButton.textContent = student ? "Save changes" : "Save student";

  if (student) {
    elements.studentName.value = student.name;
    elements.studentSubject.value = student.subject;
    elements.studentScore.value = String(student.score);
  }

  elements.dialog.showModal();
  elements.studentName.focus();
}

function closeDialog() {
  elements.dialog.close();
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

elements.addButton.addEventListener("click", () => openDialog());
elements.emptyAddButton.addEventListener("click", () => openDialog());
elements.closeButton.addEventListener("click", closeDialog);
elements.cancelButton.addEventListener("click", closeDialog);
elements.searchInput.addEventListener("input", render);

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.form.reportValidity()) return;

  const id = elements.studentId.value;
  const student = {
    id: id || createId(),
    name: elements.studentName.value.trim(),
    subject: elements.studentSubject.value.trim(),
    score: Number(elements.studentScore.value),
  };

  if (!student.name || !student.subject || !Number.isFinite(student.score)) {
    showMessage("Enter a student name, subject, and valid score.");
    return;
  }

  if (id) {
    students = students.map((existing) => (existing.id === id ? student : existing));
  } else {
    students = [...students, student];
  }

  saveStudents();
  render();
  closeDialog();
});

elements.rows.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const student = students.find((entry) => entry.id === button.dataset.id);
  if (!student) return;

  if (button.dataset.action === "edit") {
    openDialog(student);
  } else if (button.dataset.action === "delete") {
    students = students.filter((entry) => entry.id !== student.id);
    saveStudents();
    render();
  }
});

elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) closeDialog();
});

render();
