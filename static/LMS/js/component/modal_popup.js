import { addLectureBtnListenerForPopup, addQuizBtnListenerForPopup } from "./courseForm.js";
import { addNewChapterToDom, addNewLectureToDom } from "./edit_course_component.js";
import { makeRequest } from "./makeRequest.js";
import { addQuestionBtnListener, getQuizList } from "./quiz.js";
import { makeToast } from "./toast.js";

export function showModalPopup(domParser) {
    document.getElementById('renderModalForm').innerHTML = domParser.body.innerHTML
    const addPopUpModal = document.getElementById("addPopUpModal");
    addPopUpModal.classList.remove("hidden");

    // Listen for for submit and save to cloud

    document.getElementById("addFormModal").addEventListener("submit",listenerForAddFormModalFunction)
}

function listenerForAddFormModalFunction(event) {
        event.preventDefault()
        var formData = new FormData(this)

        if (formData.get("editType") == "quiz"){
            addQuestionBtnListener()
            formData.append("quizList",JSON.stringify(getQuizList()))
        }
        makeRequest(`/editCourse/${formData.get('courseId')}`,"POST",formData).then(jsonResponse=>{
            makeToast("success",jsonResponse['message'])
            // Add chapter to UI
            if (jsonResponse['editType']=="chapter") {
                addNewChapterToDom(jsonResponse['chapter'])
                addLectureBtnListenerForPopup()
                addQuizBtnListenerForPopup()
            }
            if (jsonResponse['editType']=="lecture") {
                addNewLectureToDom(jsonResponse['lecture'])
            }
            if (jsonResponse['editType']=="quiz") {
                addNewLectureToDom(jsonResponse['lecture'])
            }

            closeModalPopup()
        })
}


export function closeListenerForAddFormModalPopupOutside() {
    document.getElementById("addChapterBtn").removeEventListener("click",listenerForAddFormModalFunction)
    document.getElementById("addLectureBtn").removeEventListener("click",listenerForAddFormModalFunction)
    document.getElementById("addQuizBtn").removeEventListener("click",listenerForAddFormModalFunction)

    const closeModalBtn = document.getElementById("closeModalBtn");
    closeModalBtn.addEventListener("click", (e) => {
        closeModalPopup()
    });
}

export function closeModalPopup() {
    const addPopUpModal = document.getElementById("addPopUpModal");
    addPopUpModal.classList.add("hidden");

    const addFormModal = document.getElementById("addFormModal");
    addFormModal.reset();
}
