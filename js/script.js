function startQuiz() {
    const nameInput = document.getElementById("username");
    const studentName = nameInput.value.trim();

    if (studentName === "") {
        alert("Please enter your name");
        nameInput.focus();
        return false; 
    }

    const encodedName = encodeURIComponent(studentName);
    window.location.href = "math.html?name=" + encodedName;
    return false;
}