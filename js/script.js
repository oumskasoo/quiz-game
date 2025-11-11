function startQuiz() {
    const nameInput = document.getElementById("username");
    const subject = document.getElementById("subject").value;
    const grade = document.getElementById("grade").value;
    const studentName = nameInput.value.trim();

    if (studentName === "") {
        alert("Please enter your name");
        nameInput.focus();
        return false; 
    }

    // confirm box
    const confirmBox = document.getElementById("confirm-box");
    const confirmTitle = document.getElementById("confirm-title");
    const confirmDetails = document.getElementById("confirm-details");

    confirmTitle.textContent = `Hi ${studentName}!`;
    confirmDetails.textContent = `You're about to start the ${subject.replace('.html','')} quiz (${grade}). Ready?`;

    confirmBox.style.display = "flex";

    // 按钮行为
    document.getElementById("confirm-start").onclick = function () {
        const encodedName = encodeURIComponent(studentName);
        window.location.href = "math.html?name=" + encodedName;
    };

    document.getElementById("confirm-cancel").onclick = function () {
        confirmBox.style.display = "none";
    };

    return false;
}